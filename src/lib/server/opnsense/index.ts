import { env } from '$env/dynamic/private';
import assert from 'node:assert';
import { encodeBasicCredentials } from 'arctic/dist/request';
import { dev } from '$app/environment';
import type { OpnsenseWgServers } from '$lib/opnsense/wg';

export const opnsenseUrl = env.OPNSENSE_API_URL;
export const opnsenseAuth =
	'Basic ' + encodeBasicCredentials(env.OPNSENSE_API_KEY, env.OPNSENSE_API_SECRET);
export const opnsenseIfname = env.OPNSENSE_WG_IFNAME;

// unset secret for security
if (!dev) env.OPNSENSE_API_SECRET = '';

// this might be pretty bad if the server is down and in a bunch of other cases
// TODO: write a retry loop later
const resServers = await fetch(`${opnsenseUrl}/api/wireguard/client/list_servers`, {
	method: 'GET',
	headers: {
		Authorization: opnsenseAuth,
		Accept: 'application/json',
	},
});
assert(resServers.ok, 'Failed to fetch OPNsense WireGuard servers');
const servers = (await resServers.json()) as OpnsenseWgServers;
assert.equal(servers.status, 'ok', 'Failed to fetch OPNsense WireGuard servers');
export const serverUuid = servers.rows.find((server) => server.name === opnsenseIfname)?.uuid;
assert(serverUuid, 'Failed to find server UUID for OPNsense WireGuard server');
console.log('OPNsense WireGuard server UUID:', serverUuid);

const resServerInfo = await fetch(
	`${opnsenseUrl}/api/wireguard/client/get_server_info/${serverUuid}`,
	{
		method: 'GET',
		headers: {
			Authorization: opnsenseAuth,
			Accept: 'application/json',
		},
	},
);
assert(resServerInfo.ok, 'Failed to fetch OPNsense WireGuard server info');
const serverInfo = await resServerInfo.json();
assert.equal(serverInfo.status, 'ok', 'Failed to fetch OPNsense WireGuard server info');
export const serverPublicKey = serverInfo['pubkey'];
