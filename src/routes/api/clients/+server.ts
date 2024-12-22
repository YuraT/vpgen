import { error, type RequestHandler } from '@sveltejs/kit';
import { wgClients } from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async (event) => {
	if (!event.locals.user) {
		return error(401, 'Unauthorized');
	}

	const clients = await findClients(event.locals.user.id);
	return new Response(
		JSON.stringify({
			clients,
		})
	);
};

async function findClients(userId: string) {
	return db.query.wgClients.findMany({
		where: eq(wgClients.userId, userId),
		with: {
			ipAllocation: true
		}
	});
}

export type Clients = Awaited<ReturnType<typeof findClients>>;
