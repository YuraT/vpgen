export type ClientDetails = {
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
