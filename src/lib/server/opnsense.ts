import { env } from '$env/dynamic/private';
import assert from 'node:assert';
import { encodeBasicCredentials } from 'arctic/dist/request';
import { dev } from '$app/environment';

assert(env.OPNSENSE_API_URL, 'OPNSENSE_API_URL is not set');
assert(env.OPNSENSE_API_KEY, 'OPNSENSE_API_KEY is not set');
assert(env.OPNSENSE_API_SECRET, 'OPNSENSE_API_SECRET is not set');
assert(env.OPNSENSE_WG_IFNAME, 'OPNSENSE_WG_IFNAME is not set');

export const opnsenseUrl = env.OPNSENSE_API_URL;
export const opnsenseAuth = "Basic " + encodeBasicCredentials(env.OPNSENSE_API_KEY, env.OPNSENSE_API_SECRET);
export const opnsenseIfname = env.OPNSENSE_WG_IFNAME;

// unset secret for security
if (!dev) env.OPNSENSE_API_SECRET = "";
