import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { opnsenseAuth, opnsenseUrl } from '$lib/server/opnsense';
import type { OpnsenseWgPeers } from '$lib/opnsense/wg';

export const GET: RequestHandler = async (event) => {
	if (!event.locals.user) {
		return error(401, 'Unauthorized');
	}
	const apiUrl = `${opnsenseUrl}/api/wireguard/service/show`;
	const options: RequestInit = {
		method: 'POST',
		headers: {
			Authorization: opnsenseAuth,
			Accept: 'application/json',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			'current': 1,
			// "rowCount": 7,
			'sort': {},
			// TODO: use a more unique search phrase
			// unfortunately 64 character limit,
			// but it should be fine if users can't change their own username
			'searchPhrase': `vpgen-${event.locals.user.username}`,
			'type': ['peer'],
		}),
	};
	console.log('Fetching peers from OPNsense WireGuard API: ', apiUrl, options)

	const res = await fetch(apiUrl, options);
	const peers = await res.json() as OpnsenseWgPeers;
	peers.rows = peers.rows.filter(peer => peer['latest-handshake'])

	if (!peers) {
		return error(500, 'Error getting info from OPNsense API');
	}
	return new Response(JSON.stringify(peers), {
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': 'max-age=5',
		}
	});
};
