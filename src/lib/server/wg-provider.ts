import { assertGuard } from 'typia';
import { env } from '$env/dynamic/private';
import type { IWgProvider } from '$lib/server/types';
import { WgProviderOpnsense } from '$lib/server/wg-providers/opnsense';
import { WgProviderWgQuick } from '$lib/server/wg-providers/wg-quick';

const opnsense: IWgProvider = new WgProviderOpnsense({
	opnsenseUrl: env.OPNSENSE_API_URL,
	opnsenseApiKey: env.OPNSENSE_API_KEY,
	opnsenseApiSecret: env.OPNSENSE_API_SECRET,
	opnsenseWgIfname: env.OPNSENSE_WG_IFNAME,
});

const wgQuick: IWgProvider = new WgProviderWgQuick({
	filename: env.WG_QUICK_FILENAME,
	address: env.WG_QUICK_ADDRESS,
	privateKey: env.WG_QUICK_PRIVATE_KEY,
	listenPort: parseInt(env.WG_QUICK_LISTEN_PORT),
});

const providers = {
	opnsense,
	'wg-quick': wgQuick,
};

const chosenProvider = env.WG_PROVIDER?? 'wg-quick';
assertGuard<keyof typeof providers>(chosenProvider, () =>
	Error(`WG_PROVIDER must be one of ${Object.keys(providers).join(', ')}`),
);

const wgProvider = providers[chosenProvider];
export default wgProvider;
