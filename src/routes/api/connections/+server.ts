import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import type { OpnsenseWgPeers } from '$lib/opnsense/wg';

export const GET: RequestHandler = async ({ url }) => {
	const apiUrl = `${env.OPNSENSE_API_URL}/api/wireguard/service/show`;
	const options: RequestInit = {
		method: 'POST',
		headers: {
			Authorization: `Basic ${Buffer.from(`${env.OPNSENSE_API_KEY}:${env.OPNSENSE_API_SECRET}`).toString('base64')}`,
			Accept: 'application/json',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			"current": 1,
			// "rowCount": 7,
			"sort": {},
			"searchPhrase": "",
			"type": ["peer"],
		}),
	};
	console.log("Fetching peers from OPNsense WireGuard API: ", apiUrl, options)

	const res = await fetch(apiUrl, options);
	const peers = await res.json() as OpnsenseWgPeers;

	if (!peers) {
		error(500, "Error getting info from OPNsense API");
	}
	return new Response(JSON.stringify(peers), {
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': 'max-age=5',
		}
	});
};
