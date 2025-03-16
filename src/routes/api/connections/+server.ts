import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { findDevices } from '$lib/server/devices';
import type { ConnectionDetails } from '$lib/connections';
import type { Result } from '$lib/types';
import type { ClientConnection } from '$lib/server/types';
import wgProvider from '$lib/server/wg-provider';

export const GET: RequestHandler = async (event) => {
	if (!event.locals.user) {
		return error(401, 'Unauthorized');
	}
	console.debug('/api/connections');

	const peersResult: Result<ClientConnection[], Error> = await wgProvider.findConnections(event.locals.user);
	if (peersResult._tag === 'err') return error(500, peersResult.error.message);

	const devices = await findDevices(event.locals.user.id);
	console.debug('/api/connections: fetched db devices');


	// TODO: this is all garbage performance
	// filter devices with no recent handshakes
	const peers = peersResult.value.filter((peer) => peer.latestHandshake);

	// start from devices, to treat db as the source of truth
	const connections: ConnectionDetails[] = [];
	for (const device of devices) {
		const peerData = peers.find((peer) => peer.publicKey === device.publicKey);
		if (!peerData) continue;
		connections.push({
			deviceId: device.id,
			deviceName: device.name,
			devicePublicKey: device.publicKey,
			deviceIps: peerData.allowedIps.split(','),
			endpoint: peerData.endpoint,
			// swap rx and tx, since the opnsense values are from the server perspective
			transferRx: peerData.transferTx,
			transferTx: peerData.transferRx,
			latestHandshake: peerData.latestHandshake,
		});
	}

	return new Response(JSON.stringify(connections), {
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': 'max-age=5',
		},
	});
};
