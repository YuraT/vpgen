import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { env } from '$env/dynamic/private';
import assert from 'node:assert';

assert(env.DATABASE_URL, 'DATABASE_URL is not set');
const client = new Database(env.DATABASE_URL);
export const db = drizzle(client);
