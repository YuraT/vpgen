import type { PageLoad } from './$types';
import type { ClientDetails } from '$lib/types/clients';

export const load: PageLoad = async ({ fetch }) => {
	const res = await fetch('/api/clients');
	const { clients } = await res.json() as { clients: ClientDetails[] };

	return { clients };
};
