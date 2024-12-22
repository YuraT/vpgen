import { drizzle } from 'drizzle-orm/libsql';
import assert from 'node:assert';
import * as schema from './schema';
import { DATABASE_URL } from '$env/static/private';

assert(DATABASE_URL, 'DATABASE_URL is not set');
export const db= drizzle(DATABASE_URL, { schema });
