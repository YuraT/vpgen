import type { PageLoad } from './$types';
import type { ConnectionDetails } from '$lib/connections';

export const load: PageLoad = async ({ fetch }) => {
	const res = await fetch('/api/connections');
	const connections = await res.json() as ConnectionDetails[];

	return { connections };
};
