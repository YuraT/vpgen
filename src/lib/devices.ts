/**
 * Convert device details to WireGuard configuration.
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
 * @param device
 */
export function deviceDetailsToConfig(device: DeviceDetails): string {
	return `\
[Interface]
PrivateKey = ${device.privateKey}
Address = ${device.ips.join(', ')}
DNS = ${device.vpnDns}

[Peer]
PublicKey = ${device.vpnPublicKey}
PresharedKey = ${device.preSharedKey}
Endpoint = ${device.vpnEndpoint}
AllowedIPs = 0.0.0.0/0,::/0
`;
}

export type DeviceDetails = {
	id: number;
	name: string;
	publicKey: string;
	privateKey: string | null;
	preSharedKey: string | null;
	ips: string[];
	vpnPublicKey: string;
	vpnEndpoint: string;
	vpnDns: string;
};
