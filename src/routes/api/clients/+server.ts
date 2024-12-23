import { error } from '@sveltejs/kit';
import { wgClients } from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { createClient, getIpsFromIndex } from '$lib/server/clients';

export const GET: RequestHandler = async (event) => {
	if (!event.locals.user) {
		return error(401, 'Unauthorized');
	}

	const clients = await findClients(event.locals.user.id);
	return new Response(
		JSON.stringify({
			clients,
		}),
	);
};

async function findClients(userId: string) {
	const clientsData = await db.query.wgClients.findMany({
		columns: {
			id: true,
			name: true,
			publicKey: true,
			privateKey: true,
			preSharedKey: true,
		},
		with: {
			ipAllocation: true,
		},
		where: eq(wgClients.userId, userId),
	});
	// replace ip index with actual addresses
	return clientsData.map((client) => {
		const ips = getIpsFromIndex(client.ipAllocation.id);
		return {
			id: client.id,
			name: client.name,
			publicKey: client.publicKey,
			privateKey: client.privateKey,
			preSharedKey: client.preSharedKey,
			ips,
		};
	});
}

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
