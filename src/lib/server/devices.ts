import type { User } from '$lib/server/db/schema';
import { ipAllocations, devices } from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { opnsenseAuth, opnsenseUrl, serverPublicKey, serverUuid } from '$lib/server/opnsense';
import { Address4, Address6 } from 'ip-address';
import { env } from '$env/dynamic/private';
import { and, count, eq, isNull } from 'drizzle-orm';
import { err, ok, type Result } from '$lib/types';
import type { DeviceDetails } from '$lib/devices';
import { opnsenseSanitezedUsername } from '$lib/opnsense';

export async function findDevices(userId: string) {
	return db.query.devices.findMany({
		columns: {
			id: true,
			name: true,
			publicKey: true,
			privateKey: true,
			preSharedKey: true,
		},
		with: {
			ipAllocation: true,
		},
		where: eq(devices.userId, userId),
	});
}

export async function findDevice(userId: string, deviceId: number) {
	return db.query.devices.findFirst({
		columns: {
			id: true,
			name: true,
			publicKey: true,
			privateKey: true,
			preSharedKey: true,
		},
		with: {
			ipAllocation: true,
		},
		where: and(eq(devices.userId, userId), eq(devices.id, deviceId)),
	});
}

export function mapDeviceToDetails(
	device: Awaited<ReturnType<typeof findDevices>>[0],
): DeviceDetails {
	const ips = getIpsFromIndex(device.ipAllocation.id);
	return {
		id: device.id,
		name: device.name,
		publicKey: device.publicKey,
		privateKey: device.privateKey,
		preSharedKey: device.preSharedKey,
		ips,
		vpnPublicKey: serverPublicKey,
		vpnEndpoint: env.VPN_ENDPOINT,
		vpnDns: env.VPN_DNS,
	};
}

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

	// this is going to be quite long
	// 1. fetch params for new device from opnsense api
	// 2.1 get an allocation for the device
	// 2.2. insert new device into db
	// 2.3. update the allocation with the device id
	// 3. create the client in opnsense
	// 4. reconfigure opnsense to enable the new client
	return await db.transaction(async (tx) => {
		const [keys, availableAllocation, lastAllocation] = await Promise.all([
			// fetch params for new device from opnsense api
			getKeys(),
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

		// check for existing allocation or if we have any IPs left
		if (!availableAllocation && lastAllocation && lastAllocation.id >= parseInt(env.IP_MAX_INDEX)) {
			return err([500, 'No more IP addresses available'] as [500, string]);
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
					publicKey: keys.pubkey,
					privateKey: keys.privkey,
					preSharedKey: keys.psk,
				})
				.returning({ id: devices.id });

			// update IP allocation with device ID
			await tx2
				.update(ipAllocations)
				.set({ deviceId: newDevice.id })
				.where(eq(ipAllocations.id, ipAllocationId));

			// create client in opnsense
			const opnsenseRes = await opnsenseCreateClient({
				username: params.user.username,
				pubkey: keys.pubkey,
				psk: keys.psk,
				allowedIps: getIpsFromIndex(ipAllocationId).join(','),
			});
			const opnsenseResJson = await opnsenseRes.json();
			if (opnsenseResJson['result'] !== 'saved') {
				tx2.rollback();
				console.error(`Error creating client in OPNsense: \n${opnsenseResJson}`);
				return err([500, 'Error creating client in OPNsense'] as [500, string]);
			}

			// reconfigure opnsense
			await opnsenseReconfigure();
			return ok(newDevice.id);
		});
	});
}

async function getKeys() {
	// fetch key pair from opnsense
	const options: RequestInit = {
		method: 'GET',
		headers: {
			Authorization: opnsenseAuth,
			Accept: 'application/json',
		},
	};
	const resKeyPair = await fetch(`${opnsenseUrl}/api/wireguard/server/key_pair`, options);
	const resPsk = await fetch(`${opnsenseUrl}/api/wireguard/client/psk`, options);
	const keyPair = await resKeyPair.json();
	const psk = await resPsk.json();
	return {
		pubkey: keyPair['pubkey'] as string,
		privkey: keyPair['privkey'] as string,
		psk: psk['psk'] as string,
	};
}

export function getIpsFromIndex(ipIndex: number) {
	ipIndex -= 1; // 1-indexed in the db
	const v4StartingAddr = new Address4(env.IPV4_STARTING_ADDR);
	const v6StartingAddr = new Address6(env.IPV6_STARTING_ADDR);
	const v4Allowed = Address4.fromBigInt(v4StartingAddr.bigInt() + BigInt(ipIndex));
	const v6Offset = BigInt(ipIndex) << (128n - BigInt(env.IPV6_CLIENT_PREFIX_SIZE));
	const v6Allowed = Address6.fromBigInt(v6StartingAddr.bigInt() + v6Offset);
	const v6AllowedShort = v6Allowed.parsedAddress.join(':');

	return [v4Allowed.address + '/32', v6AllowedShort + '/' + env.IPV6_CLIENT_PREFIX_SIZE];
}

async function opnsenseCreateClient(params: {
	username: string;
	pubkey: string;
	psk: string;
	allowedIps: string;
}) {
	return fetch(`${opnsenseUrl}/api/wireguard/client/addClientBuilder`, {
		method: 'POST',
		headers: {
			Authorization: opnsenseAuth,
			Accept: 'application/json',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			configbuilder: {
				enabled: '1',
				name: `vpgen-${opnsenseSanitezedUsername(params.username)}`,
				pubkey: params.pubkey,
				psk: params.psk,
				tunneladdress: params.allowedIps,
				server: serverUuid,
				endpoint: env.VPN_ENDPOINT,
			},
		}),
	});
}

async function opnsenseReconfigure() {
	return fetch(`${opnsenseUrl}/api/wireguard/service/reconfigure`, {
		method: 'POST',
		headers: {
			Authorization: opnsenseAuth,
			Accept: 'application/json',
		},
	});
}
