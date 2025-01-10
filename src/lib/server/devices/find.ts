import { db } from '$lib/server/db';
import { and, eq } from 'drizzle-orm';
import { devices } from '$lib/server/db/schema';
import type { DeviceDetails } from '$lib/devices';
import { serverPublicKey } from '$lib/server/opnsense';
import { env } from '$env/dynamic/private';
import { getIpsFromIndex } from '$lib/server/devices/index';

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
