import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { findClient, mapClientToDetails } from '$lib/server/clients';

export const GET: RequestHandler = async (event) => {
	if (!event.locals.user) {
		return error(401, 'Unauthorized');
	}

	const { id } = event.params;
	const clientId = parseInt(id);
	if (isNaN(clientId)) {
		return error(400, 'Invalid client ID');
	}
	const client = await findClient(event.locals.user.id, clientId);
	if (!client) {
		return error(404, 'Client not found');
	}
	return new Response(JSON.stringify(mapClientToDetails(client)));
};
