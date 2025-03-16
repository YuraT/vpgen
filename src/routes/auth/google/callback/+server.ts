import type { RequestHandler } from './$types';
import * as arctic from 'arctic';
import { google } from '$lib/server/oauth';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';
import { createSession, isValidInviteToken, setSessionTokenCookie } from '$lib/server/auth';
import type { OAuth2Tokens } from 'arctic';
import { assertGuard } from 'typia';

export const GET: RequestHandler = async (event) => {
	const { url, cookies } = event;
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const storedState = cookies.get('google_oauth_state') ?? null;
	const codeVerifier = cookies.get('google_code_verifier', ) ?? null;
	const inviteToken = cookies.get('invite_token') ?? null;

	if (code === null || state === null || storedState === null || codeVerifier === null) {
		return new Response(null, {
			status: 400,
		});
	}

	let tokens: OAuth2Tokens;
	try {
		tokens = await google.validateAuthorizationCode(code, codeVerifier);
	} catch (e) {
		if (e instanceof arctic.OAuth2RequestError) {
			console.debug('Arctic: OAuth: invalid authorization code, credentials, or redirect URI', e);
			return new Response(null, {
				status: 400,
			});
		}
		if (e instanceof arctic.ArcticFetchError) {
			console.debug('Arctic: failed to call `fetch()`', e);
			return new Response(null, {
				status: 400,
			});
		}

		return new Response(null, {
			status: 500,
		});
	}

	const idToken = tokens.idToken();
	const claims = arctic.decodeIdToken(idToken);

	console.log('claims', claims);

	assertGuard<{
		sub: string;
		email: string;
		name: string;
	}>(claims);

	const userId = claims.sub;
	const existingUser = await db.query.users.findFirst({ where: eq(table.users.id, userId) });

	if (existingUser) {
		const session = await createSession(existingUser.id);
		setSessionTokenCookie(event, session.id, session.expiresAt);
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/',
			},
		});
	}

	// TODO: proper error page
	if (inviteToken === null || !isValidInviteToken(inviteToken)) {
		return new Response(null, {
			status: 400,
		});
	}

	const user: table.User = {
		id: userId,
		authSource: 'google',
		username: claims.email,
		name: claims.name,
	};

	// TODO: proper error handling, delete cookies
	await db.insert(table.users).values(user);
	console.log('created user', user, 'with invite token', inviteToken);

	const session = await createSession(user.id);

	setSessionTokenCookie(event, session.id, session.expiresAt);

	return new Response(null, {
		status: 302,
		headers: {
			Location: '/',
		},
	});
};
