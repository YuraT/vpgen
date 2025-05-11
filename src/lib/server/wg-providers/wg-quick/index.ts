import assert from 'node:assert';
import { appendFile } from 'node:fs/promises';
import type { ClientConnection, CreateClientParams, IWgProvider, WgKeys } from '$lib/server/types';
import { err, ok, type Result } from '$lib/types';
import {
	type IWgQuickInterfaceConfig,
	wgGenPrivKey,
	wgGenPsk,
	wgGenPubKey,
	wgPeerConfig,
	wgQuickInterfaceConfig, wgQuickUp
} from './snippets';
import type { User } from '$lib/server/db/schema';

export class WgProviderWgQuick implements IWgProvider {
	private filename: string;
	private publicKey?: string;
	private config: IWgQuickInterfaceConfig;

	constructor(params: WgQuickParams) {
		this.filename = params.filename;
		this.config = {
			address: params.address,
			privateKey: params.privateKey,
			listenPort: params.listenPort,
		};
	}

	async init(): Promise<Result<null, Error>> {
		const file = Bun.file(this.filename);

		this.publicKey = await wgGenPubKey(this.config.privateKey);
		console.log(`wg-quick: running with public key: ${this.publicKey}`);
		if (await file.exists()) {
			// TODO: Check if the file is a valid WireGuard config file and our settings match
			return ok(null);
		}
		await Bun.write(this.filename, wgQuickInterfaceConfig(this.config) + '\n');
		console.log('created wg-quick config file', this.filename);
		return wgQuickUp(this.filename);
	}

	getServerPublicKey(): string {
		assert(this.publicKey, 'WgQuick public key not set, init() must be called first');
		return this.publicKey;
	}

	async generateKeys(): Promise<Result<WgKeys, Error>> {
		const privateKey = await wgGenPrivKey();
		const publicKey = await wgGenPubKey(privateKey);
		const preSharedKey = await wgGenPsk();
		return ok({
			publicKey,
			privateKey,
			preSharedKey,
		});
	}

	async createClient(params: CreateClientParams): Promise<Result<null, Error>> {
		const peerConfig = wgPeerConfig(params);
		await appendFile(this.filename, peerConfig + `\n`);
		return ok(null);
	}

	async findConnections(user: User): Promise<Result<ClientConnection[], Error>> {
		return err(Error('WgProviderWgQuick: listing connection information is not yet supported'));
	}

	async deleteClient(publicKey: string): Promise<Result<null, Error>> {
		return err(Error('WgProviderWgQuick: deleting client is not yet supported'));
	}
}

interface WgQuickParams extends IWgQuickInterfaceConfig {
	filename: string;
}
