import type { PageLoad } from './$types';
import type { ClientDetails } from '$lib/types/clients';
import { clientDetailsToConfig } from '$lib/clients';

export const load: PageLoad = async ({ fetch, params }) => {
	const res = await fetch(`/api/clients/${params.id}`);
	const client = (await res.json()) as ClientDetails;
	const config = clientDetailsToConfig(client);

	return { client, config };
};
