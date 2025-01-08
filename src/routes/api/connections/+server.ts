import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { opnsenseAuth, opnsenseUrl } from '$lib/server/opnsense';
import type { OpnsenseWgPeers } from '$lib/opnsense/wg';
import { findDevices } from '$lib/server/devices';
import type { ConnectionDetails } from '$lib/connections';

export const GET: RequestHandler = async (event) => {
	if (!event.locals.user) {
		return error(401, 'Unauthorized');
	}
	console.debug('/api/connections');
	const peers = await fetchOpnsensePeers(event.locals.user.username);
	console.debug('/api/connections: fetched opnsense peers', peers.rowCount);
	const devices = await findDevices(event.locals.user.id);
	console.debug('/api/connections: fetched db devices');

	if (!peers) {
		return error(500, 'Error getting info from OPNsense API');
	}

	// TODO: this is all garbage performance
	// filter devices with no recent handshakes
	peers.rows = peers.rows.filter((peer) => peer['latest-handshake']);

	// start from devices, to treat db as the source of truth
	const connections: ConnectionDetails[] = [];
	for (const device of devices) {
		const peerData = peers.rows.find((peer) => peer['public-key'] === device.publicKey);
		if (!peerData) continue;
		connections.push({
			deviceId: device.id,
			deviceName: device.name,
			devicePublicKey: device.publicKey,
			deviceIps: peerData['allowed-ips'].split(','),
			endpoint: peerData['endpoint'],
			// swap rx and tx, since the opnsense values are from the server perspective
			transferRx: peerData['transfer-tx'],
			transferTx: peerData['transfer-rx'],
			latestHandshake: peerData['latest-handshake'] * 1000,
		});
	}

	return new Response(JSON.stringify(connections), {
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': 'max-age=5',
		},
	});
};

async function fetchOpnsensePeers(username: string) {
	const apiUrl = `${opnsenseUrl}/api/wireguard/service/show`;
	const options: RequestInit = {
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
			// TODO: use a more unique search phrase
			// unfortunately 64 character limit,
			// but it should be fine if users can't change their own username
			searchPhrase: `vpgen-${username}`,
			type: ['peer'],
		}),
	};

	const res = await fetch(apiUrl, options);
	return (await res.json()) as OpnsenseWgPeers;
}
