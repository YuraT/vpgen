import { users, wgClients } from './schema';
import { eq } from 'drizzle-orm';
import assert from 'node:assert';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from '$lib/server/db/schema';

assert(process.env.DATABASE_URL, 'DATABASE_URL is not set');
const db = drizzle(process.env.DATABASE_URL, { schema });

export async function seed() {
	const user = await db.query.users.findFirst({ where: eq(users.username, 'CaZzzer') });
	assert(user, 'User not found');

	const clients = [
		{
			userId: user.id,
			name: 'Client1',
			publicKey: 'BJ5faPVJsDP4CCxNYilmKnwlQXOtXEOJjqIwb4U/CgM=',
			privateKey: 'KKqsHDu30WCSrVsyzMkOKbE3saQ+wlx0sBwGs61UGXk=',
			preSharedKey: '0LWopbrISXBNHUxr+WOhCSAg+0hD8j3TLmpyzHkBHCQ=',
			ipIndex: 1,
			// allowedIps: '10.18.11.101/32,fd00::1/112',
		}
	]

	await db.insert(wgClients).values(clients);
}

seed();
