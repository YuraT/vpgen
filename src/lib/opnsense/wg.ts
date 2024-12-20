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
