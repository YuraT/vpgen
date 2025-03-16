import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { devices } from '$lib/server/db/schema';
import { err, ok, type Result } from '$lib/types';
import wgProvider from '$lib/server/wg-provider';

export async function deleteDevice(
	userId: string,
	deviceId: number,
): Promise<Result<null, [400 | 500, string]>> {
	const device = await db.query.devices.findFirst({
		columns: {
			publicKey: true,
		},
		where: and(eq(devices.userId, userId), eq(devices.id, deviceId)),
	});
	if (!device) return err([400, 'Device not found']);

	const providerDeletionResult = await wgProvider.deleteClient(device.publicKey);
	if (providerDeletionResult._tag === 'err') {
		console.error('failed to delete provider client for device', deviceId, device.publicKey);
		return err([500, 'Error deleting client in provider']);
	}

	await db.delete(devices).where(eq(devices.id, deviceId));
	return ok(null);
}
