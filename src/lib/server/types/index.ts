import type { Result } from '$lib/types';
import type { User } from '$lib/server/db/schema';

export interface IWgProvider {
	init(): Promise<Result<null, Error>>;

	getServerPublicKey(): string;

	generateKeys(): Promise<Result<WgKeys, Error>>;

	createClient(params: CreateClientParams): Promise<Result<null, Error>>;

	findConnections(user: User): Promise<Result<ClientConnection[], Error>>;

	deleteClient(publicKey: string): Promise<Result<null, Error>>;
}

export type WgKeys = {
	publicKey: string;
	privateKey: string;
	preSharedKey: string;
};

export type CreateClientParams = {
	user: User;
	publicKey: string;
	preSharedKey: string;
	allowedIps: string;
}

export type ClientConnection = {
	publicKey: string;
	endpoint: string;
	allowedIps: string;
	transferRx: number;
	transferTx: number;
	latestHandshake: number;
}
