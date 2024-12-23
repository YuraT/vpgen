import type { ClientDetails } from '$lib/types/clients';

/**
 * Convert client details to WireGuard configuration.
 *
 * ```conf
 * [Interface]
 * PrivateKey = wPa07zR0H4wYoc1ljfeiqlSbR8Z28pPc6jplwE7zPms=
 * Address = 10.18.11.100/32,fd00::1/128
 * DNS = 10.18.11.1,fd00::0
 *
 * [Peer]
 * PublicKey = BJ5faPVJsDP4CCxNYilmKnwlQXOtXEOJjqIwb4U/CgM=
 * PresharedKey = uhZUVqXKF0oayP0BS6yPu6Gepgh68Nz9prtbE5Cuok0=
 * Endpoint = vpn.lab.cazzzer.com:51820
 * AllowedIPs = 0.0.0.0/0,::/0
 * ```
 * @param client
 */
export function clientDetailsToConfig(client: ClientDetails): string {
	return `\
[Interface]
PrivateKey = ${client.privateKey}
Address = ${client.ips.join(', ')}
DNS = ${client.vpnDns}

[Peer]
PublicKey = ${client.vpnPublicKey}
PresharedKey = ${client.preSharedKey}
Endpoint = ${client.vpnEndpoint}
AllowedIPs = 0.0.0.0/0,::/0
`;
}
