export type ConnectionDetails = {
	deviceId: number;
	deviceName: string;
	devicePublicKey: string;
	deviceIps: string[];
	endpoint: string;
	transferRx: number;
	transferTx: number;
	latestHandshake: number;
};
