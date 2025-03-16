export interface PeerRow {
	if: string;
	type: "peer";
	'public-key': string;
	endpoint: string;
	'allowed-ips': string;
	'latest-handshake': number;
	'transfer-rx': number;
	'transfer-tx': number;
	'persistent-keepalive': string;
	name: string;
	ifname: string;
}

/**
 * Sample response from OPNsense WireGuard API
 * ```json
 * {
 *   "total": 17,
 *     "rowCount": 7,
 *     "current": 1,
 *     "rows": [
 *   {
 *     "if": "wg0",
 *     "type": "peer",
 *     "public-key": "iJa5JmJbMHNlbEluNwoB2Q8LyrPAfb7S/mluanMcI08=",
 *     "endpoint": "10.17.20.107:42516",
 *     "allowed-ips": "fd00::1/112,10.6.0.3/32",
 *     "latest-handshake": 1729319339,
 *     "transfer-rx": 1052194743,
 *     "transfer-tx": 25203263456,
 *     "persistent-keepalive": "off",
 *     "name": "Yura-TPX13",
 *     "ifname": "wg0"
 *   }
 * ]
 * }
 * ```
 */
export interface OpnsenseWgPeers {
	total: number;
	rowCount: number;
	current: number;
	rows: PeerRow[];
}

/**
 * Sample request to OPNsense WireGuard API
 * ```js
 * const url = 'https://opnsense.home/api/wireguard/service/show';
 * const options = {
 *   method: 'POST',
 *   headers: {
 *     Authorization: 'Basic ...',
 *     'Content-Type': 'application/json',
 *     Accept: 'application/json',
 *   },
 *   body: '{"current":1,"rowCount":7,"sort":{},"searchPhrase":"","type":["peer"]}'
 * };
 * ```
 */

export interface OpnsenseWgServers {
	status: "ok" | string | number;
	rows: {
		name: string;
		uuid: string;
	}[];
}

/**
 * Sample response for OPNsense WireGuard clients
 * ```json
 * {
 *   "rows": [
 *     {
 *       "uuid": "d99334de-7671-4ca7-9c9b-5f5578acae70",
 *       "enabled": "1",
 *       "name": "Yura-TPX13",
 *       "pubkey": "iJa5JmJbMHNlbEluNwoB2Q8LyrPAfb7S/mluanMcI08=",
 *       "tunneladdress": "fd00::1/112,10.6.0.3/32",
 *       "serveraddress": "",
 *       "serverport": "",
 *       "servers": "wg0"
 *     }
 *   ],
 *   "rowCount": 1,
 *   "total": 10,
 *   "current": 1
 * }
 * ```
 */
export interface OpnsenseWgClients {
	rowCount: number;
	total: number;
	current: number;
	rows: {
		uuid: string;
		enabled: string;
		name: string;
		pubkey: string;
		tunneladdress: string;
		serveraddress: string;
		serverport: string;
		servers: string;
	}[];
}
