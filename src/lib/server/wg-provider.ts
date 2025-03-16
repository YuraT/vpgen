import { WgProviderOpnsense } from '$lib/server/wg-providers/opnsense';
import { env } from '$env/dynamic/private';
import type { IWgProvider } from '$lib/server/types';

const wgProvider: IWgProvider = new WgProviderOpnsense({
	opnsenseUrl: env.OPNSENSE_API_URL,
	opnsenseApiKey: env.OPNSENSE_API_KEY,
	opnsenseApiSecret: env.OPNSENSE_API_SECRET,
	opnsenseWgIfname: env.OPNSENSE_WG_IFNAME,
});

export default wgProvider;
