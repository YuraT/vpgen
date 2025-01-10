import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { devices } from '$lib/server/db/schema';
import { err, ok, type Result } from '$lib/types';
import { opnsenseAuth, opnsenseUrl } from '$lib/server/opnsense';

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
	const opnsenseClientUuid = (await opnsenseFindClient(device.publicKey))?.['uuid'];
	if (typeof opnsenseClientUuid !== 'string') {
		console.error(
			'failed to get OPNsense client for deletion for device',
			deviceId,
			device.publicKey,
		);
		return err([500, 'Error getting client from OPNsense']);
	}

	const opnsenseDeletionResult = await opnsenseDeleteClient(opnsenseClientUuid);
	if (opnsenseDeletionResult?.['result'] !== 'deleted') {
		console.error(
			'failed to delete OPNsense client for device',
			deviceId,
			device.publicKey,
			'\n',
			'OPNsense client uuid:',
			opnsenseClientUuid,
		);
		return err([500, 'Error deleting client in OPNsense']);
	}

	await db.delete(devices).where(eq(devices.id, deviceId));
	return ok(null);
}

async function opnsenseFindClient(pubkey: string) {
	const res = await fetch(`${opnsenseUrl}/api/wireguard/client/searchClient`, {
		method: 'POST',
		headers: {
			Authorization: opnsenseAuth,
			Accept: 'application/json',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			current: 1,
			// "rowCount": 7,
			sort: {},
			searchPhrase: pubkey,
			type: ['peer'],
		}),
	});
	return (await res.json())?.rows?.[0] ?? null;
}

async function opnsenseDeleteClient(clientUuid: string) {
	const res = await fetch(`${opnsenseUrl}/api/wireguard/client/delClient/${clientUuid}`, {
		method: 'POST',
		headers: {
			Authorization: opnsenseAuth,
			Accept: 'application/json',
		},
	});
	return res.json();
}
