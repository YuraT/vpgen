import { $ } from 'bun';
import type { CreateClientParams } from '$lib/server/types';
import { err, ok, type Result } from '$lib/types';

export type IWgQuickInterfaceConfig = {
	address: string;
	privateKey: string;
	listenPort: number;
}

export function wgQuickInterfaceConfig(params: IWgQuickInterfaceConfig): string {
	return`\
[Interface]
Address = ${params.address}
PrivateKey = ${params.privateKey}
ListenPort = ${params.listenPort}
`;
}

export function wgPeerConfig(params: CreateClientParams): string {
	return`\
[Peer]
PublicKey = ${params.publicKey}
PresharedKey = ${params.preSharedKey}
AllowedIPs = ${params.allowedIps}
# vpgen-user = ${params.user.username}
`;
}

export async function runCommand(command: string): Promise<Result<null, Error>> {
	const result = await $`${command}`;
	if (result.exitCode !== 0) return err(Error(`'${command}' failed with exit code ${result.exitCode}\n${result.stderr.toString()}`));
	return ok(null);
}

export async function wgQuickUp(ifname: string): Promise<Result<null, Error>> {
	return runCommand(`wg-quick up ${ifname}`);
}

export async function wgQuickDown(ifname: string): Promise<Result<null, Error>> {
	return runCommand(`wg-quick down ${ifname}`);
}

export async function wgReload(ifname: string): Promise<Result<null, Error>> {
	return runCommand(`wg-quick strip ${ifname} | wg syncconf ${ifname} /dev/stdin`);
	// return runCommand(`wg syncconf ${ifname} <(wg-quick strip ${ifname})`);
}

export async function wgGenPubKey(privateKey: string) {
	return (await $`echo ${privateKey} | wg pubkey`.text()).trim();
}

export async function wgGenPrivKey() {
	return (await $`wg genkey`.text()).trim();
}

export async function wgGenPsk() {
	return (await $`wg genpsk`.text()).trim();
}
