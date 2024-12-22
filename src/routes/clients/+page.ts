import type { PageLoad } from './$types';
import type { Clients } from '../api/clients/+server';

export const load: PageLoad = async ({ fetch }) => {
	const res = await fetch('/api/clients');
	const { clients } = await res.json() as { clients: Clients };

	return { clients };
};
