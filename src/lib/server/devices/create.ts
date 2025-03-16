import { devices, ipAllocations, type User } from '$lib/server/db/schema';
import { err, ok, type Result } from '$lib/types';
import { db } from '$lib/server/db';
import { count, eq, isNull } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import { getIpsFromIndex } from './utils';
import wgProvider from '$lib/server/wg-provider';

export async function createDevice(params: {
	name: string;
	user: User;
}): Promise<Result<number, [400 | 500, string]>> {
	// check if user exceeds the limit of devices
	const [{ deviceCount }] = await db
		.select({ deviceCount: count() })
		.from(devices)
		.where(eq(devices.userId, params.user.id));
	if (deviceCount >= parseInt(env.MAX_CLIENTS_PER_USER))
		return err([400, 'Maximum number of devices reached'] as [400, string]);

	// 1. fetch params for new device from provider
	// 2.1 get an allocation for the device
	// 2.2. insert new device into db
	// 2.3. update the allocation with the device id
	// 3. create the client in provider
	return await db.transaction(async (tx) => {
		const [keysResult, availableAllocation, lastAllocation] = await Promise.all([
			// fetch params for new device from provider
			wgProvider.generateKeys(),
			// find first unallocated IP
			await tx.query.ipAllocations.findFirst({
				columns: {
					id: true,
				},
				where: isNull(ipAllocations.deviceId),
			}),
			// find last allocation to check if we have any IPs left
			await tx.query.ipAllocations.findFirst({
				columns: {
					id: true,
				},
				orderBy: (ipAllocations, { desc }) => desc(ipAllocations.id),
			}),
		]);

		if (keysResult?._tag === 'err') return err([500, 'Failed to get keys']);
		const keys = keysResult.value;

		// check for existing allocation or if we have any IPs left
		if (!availableAllocation && lastAllocation && lastAllocation.id >= parseInt(env.IP_MAX_INDEX)) {
			return err([500, 'No more IP addresses available']);
		}

		// use existing allocation or create a new one
		const ipAllocationId =
			availableAllocation?.id ??
			(await tx.insert(ipAllocations).values({}).returning({ id: ipAllocations.id }))[0].id;

		// transaction savepoint after creating a new IP allocation
		// TODO: not sure if this is needed
		return await tx.transaction(async (tx2) => {
			// create new device in db
			const [newDevice] = await tx2
				.insert(devices)
				.values({
					userId: params.user.id,
					name: params.name,
					publicKey: keys.publicKey,
					privateKey: keys.privateKey,
					preSharedKey: keys.preSharedKey,
				})
				.returning({ id: devices.id });

			// update IP allocation with device ID
			await tx2
				.update(ipAllocations)
				.set({ deviceId: newDevice.id })
				.where(eq(ipAllocations.id, ipAllocationId));

			// create client in provider
			const providerRes = await wgProvider.createClient({
				user: params.user,
				publicKey: keys.publicKey,
				preSharedKey: keys.preSharedKey,
				allowedIps: getIpsFromIndex(ipAllocationId).join(','),
			});
			if (providerRes._tag === 'err') {
				tx2.rollback();
				return err([500, 'Failed to create client in provider']);
			}
			return ok(newDevice.id);
		});
	});
}
