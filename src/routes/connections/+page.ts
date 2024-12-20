import type { PageLoad } from './$types';
import type { OpnsenseWgPeers } from '$lib/opnsense/wg';

export const load: PageLoad = async ({ fetch }) => {
	const res = await fetch('/api/connections');
	const peers = await res.json() as OpnsenseWgPeers;

	return { peers };
};
