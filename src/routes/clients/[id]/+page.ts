import type { PageLoad } from './$types';
import type { ClientDetails } from '$lib/types/clients';
import { clientDetailsToConfig } from '$lib/clients';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ fetch, params }) => {
	const res = await fetch(`/api/clients/${params.id}`);
	const resJson = await res.json();
	if (!res.ok) {
		return error(res.status, resJson['message']);
	}
	const client = resJson as ClientDetails;
	const config = clientDetailsToConfig(client);

	return { client, config };
};
