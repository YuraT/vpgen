import type { ClientConnection, CreateClientParams, IWgProvider, WgKeys } from '$lib/server/types';
import { encodeBasicCredentials } from 'arctic/dist/request';
import { is } from 'typia';
import type { OpnsenseWgPeers, OpnsenseWgServers } from '$lib/server/wg-providers/opnsense/types';
import { err, ok, type Result } from '$lib/types';
import assert from 'node:assert';
import type { User } from '$lib/server/db/schema';

export class WgProviderOpnsense implements IWgProvider {
	private opnsenseUrl: string;
	private opnsenseAuth: string;
	private opnsenseIfname: string;
	private opnsenseWgServerUuid: string | undefined;
	private opnsenseWgServerPublicKey: string | undefined;

	public constructor(params: OpnsenseParams) {
		this.opnsenseUrl = params.opnsenseUrl;
		this.opnsenseAuth =
			'Basic ' + encodeBasicCredentials(params.opnsenseApiKey, params.opnsenseApiSecret);
		this.opnsenseIfname = params.opnsenseWgIfname;
	}

	public async init():  Promise<Result<null, Error>> {
		const resServers = await fetch(`${this.opnsenseUrl}/api/wireguard/client/list_servers`, {
			method: 'GET',
			headers: {
				Authorization: this.opnsenseAuth,
				Accept: 'application/json',
			},
		});

		const servers = await resServers.json();
		if (!is<OpnsenseWgServers>(servers)) {
			console.error('Unexpected response for OPNsense WireGuard servers', servers);
			return err(new Error('Failed to fetch OPNsense WireGuard servers'));
		}

		const uuid = servers.rows.find((server) => server.name === this.opnsenseIfname)?.uuid;
		if (!uuid) {
			console.error('OPNsense WireGuard servers', servers);
			return err(new Error('Failed to find server UUID for OPNsense WireGuard server'));
		}

		const resServerInfo = await fetch(
			`${this.opnsenseUrl}/api/wireguard/client/get_server_info/${uuid}`,
			{
				method: 'GET',
				headers: {
					Authorization: this.opnsenseAuth,
					Accept: 'application/json',
				},
			},
		);
		const serverInfo = await resServerInfo.json();
		const serverPublicKey = serverInfo['pubkey'];
		if (serverInfo['status'] !== 'ok' || typeof serverPublicKey !== 'string') {
			console.error('Failed to fetch OPNsense WireGuard server info', serverInfo);
			return err(new Error('Failed to fetch OPNsense WireGuard server info'));
		}

		console.debug('OPNsense WireGuard server UUID:', uuid);
		console.debug('OPNsense WireGuard server public key:', serverPublicKey);
		this.opnsenseWgServerUuid = uuid;
		this.opnsenseWgServerPublicKey = serverPublicKey;
		return ok(null);
	}

	getServerPublicKey(): string {
		assert(
			this.opnsenseWgServerPublicKey,
			'OPNsense server public key not set, init() must be called first',
		);
		return this.opnsenseWgServerPublicKey;
	}

	public async generateKeys(): Promise<Result<WgKeys, Error>> {
		const options: RequestInit = {
			method: 'GET',
			headers: {
				Authorization: this.opnsenseAuth,
				Accept: 'application/json',
			},
		};
		const resKeyPair = await fetch(`${this.opnsenseUrl}/api/wireguard/server/key_pair`, options);
		const resPsk = await fetch(`${this.opnsenseUrl}/api/wireguard/client/psk`, options);
		const keyPair = await resKeyPair.json();
		const psk = await resPsk.json();

		if (!is<{ pubkey: string; privkey: string }>(keyPair)) {
			console.error('Unexpected response for OPNsense key pair', keyPair);
			return err(new Error('Failed to fetch OPNsense key pair'));
		}
		if (!is<{ psk: string }>(psk)) {
			console.error('Unexpected response for OPNsense PSK', psk);
			return err(new Error('Failed to fetch OPNsense PSK'));
		}

		return ok({
			publicKey: keyPair.pubkey,
			privateKey: keyPair.privkey,
			preSharedKey: psk.psk,
		});
	}

	async createClient(params: CreateClientParams): Promise<Result<null, Error>> {
		assert(this.opnsenseWgServerUuid, 'OPNsense server UUID not set, init() must be called first');

		const createClientRes = await fetch(
			`${this.opnsenseUrl}/api/wireguard/client/addClientBuilder`,
			{
				method: 'POST',
				headers: {
					Authorization: this.opnsenseAuth,
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					configbuilder: {
						enabled: '1',
						name: `vpgen-${opnsenseSanitezedUsername(params.user.username)}`,
						pubkey: params.publicKey,
						psk: params.preSharedKey,
						tunneladdress: params.allowedIps,
						server: this.opnsenseWgServerUuid,
						endpoint: '',
					},
				}),
			},
		);
		const createClientResJson = await createClientRes.json();
		if (createClientResJson['result'] !== 'saved') {
			console.error('Error creating client in OPNsense', createClientResJson);
			return err(new Error('Failed to create client in OPNsense'));
		}

		const reconfigureRes = await fetch(`${this.opnsenseUrl}/api/wireguard/service/reconfigure`, {
			method: 'POST',
			headers: {
				Authorization: this.opnsenseAuth,
				Accept: 'application/json',
			},
		});

		if (reconfigureRes.status !== 200) {
			console.error('Error reconfiguring OPNsense', reconfigureRes);
			return err(new Error('Failed to reconfigure OPNsense'));
		}

		return ok(null);
	}

	async findConnections(user: User): Promise<Result<ClientConnection[], Error>> {
		const res = await fetch(`${this.opnsenseUrl}/api/wireguard/service/show`, {
			method: 'POST',
			headers: {
				Authorization: this.opnsenseAuth,
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				current: 1,
				// "rowCount": 7,
				sort: {},
				// TODO: use a more unique search phrase
				// unfortunately 64 character limit,
				// but it should be fine if users can't change their own username
				searchPhrase: `vpgen-${opnsenseSanitezedUsername(user.username)}`,
				type: ['peer'],
			}),
		});

		const peers = await res.json();
		if (!is<OpnsenseWgPeers>(peers)) {
			console.error('Unexpected response for OPNsense WireGuard peers', peers);
			return err(new Error('Failed to fetch OPNsense WireGuard peers'));
		}

		return ok(
			peers.rows.map((peer) => {
				return {
					publicKey: peer['public-key'],
					endpoint: peer['endpoint'],
					allowedIps: peer['allowed-ips'],
					transferRx: peer['transfer-rx'],
					transferTx: peer['transfer-tx'],
					latestHandshake: peer['latest-handshake'] * 1000,
				};
			}),
		);
	}

	async deleteClient(publicKey: string): Promise<Result<null, Error>> {
		const client = await this.findOpnsenseClient(publicKey);
		const clientUuid = client?.uuid;
		if (typeof clientUuid !== 'string') {
			console.error('Failed to get OPNsense client UUID for deletion', client);
			return err(new Error('Failed to get OPNsense client UUID for deletion'));
		}

		const res = await fetch(`${this.opnsenseUrl}/api/wireguard/client/delClient/${clientUuid}`, {
			method: 'POST',
			headers: {
				Authorization: this.opnsenseAuth,
				Accept: 'application/json',
			},
		});
		const resJson = await res.json();
		if (resJson['result'] !== 'deleted') {
			console.error('Failed to delete OPNsense client', resJson);
			return err(new Error('Failed to delete OPNsense client'));
		}

		return ok(null);
	}

	private async findOpnsenseClient(publicKey: string) {
		const res = await fetch(`${this.opnsenseUrl}/api/wireguard/client/searchClient`, {
			method: 'POST',
			headers: {
				Authorization: this.opnsenseAuth,
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				current: 1,
				sort: {},
				searchPhrase: publicKey,
				type: ['peer'],
			}),
		});
		return (await res.json())?.rows?.[0] ?? null;
	}
}

function opnsenseSanitezedUsername(username: string) {
	return username.slice(0, 63).replace(/[^a-zA-Z0-9_-]/g, '_');
}

export type OpnsenseParams = {
	opnsenseUrl: string;
	opnsenseApiKey: string;
	opnsenseApiSecret: string;
	opnsenseWgIfname: string;
};
