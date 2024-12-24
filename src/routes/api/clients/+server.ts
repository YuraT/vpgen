import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createClient, findClients, mapClientToDetails } from '$lib/server/clients';

export const GET: RequestHandler = async (event) => {
	if (!event.locals.user) {
		return error(401, 'Unauthorized');
	}

	const clients = await findClients(event.locals.user.id);
	return new Response(
		JSON.stringify({
			clients: clients.map(mapClientToDetails),
		}),
	);
};


export type Clients = Awaited<ReturnType<typeof findClients>>;

export const POST: RequestHandler = async (event) => {
	if (!event.locals.user) {
		return error(401, 'Unauthorized');
	}
	const { name } = await event.request.json();
	const res = await createClient({
		name,
		user: event.locals.user,
	});

	switch (res._tag) {
		case 'ok': {
			return new Response(null, {
				status: 201,
			});
		}
		case 'err': {
			const [status, message] = res.error;
			return error(status, message);
		}
	}
};
