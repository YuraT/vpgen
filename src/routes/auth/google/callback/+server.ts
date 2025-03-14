import type { RequestHandler } from './$types';
import * as arctic from 'arctic';
import { google } from '$lib/server/oauth';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';
import { createSession, isValidInviteToken, setSessionTokenCookie } from '$lib/server/auth';
import type { OAuth2Tokens } from 'arctic';

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
			// Invalid authorization code, credentials, or redirect URI
			console.debug(e);
			console.debug(state)
			return new Response(null, {
				status: 400,
			});
		}
		if (e instanceof arctic.ArcticFetchError) {
			// Failed to call `fetch()`
			console.debug(e.cause);
			return new Response(null, {
				status: 400,
			});
		}
	}

	const accessToken = tokens.accessToken();
	const idToken = tokens.idToken();
	const claims = arctic.decodeIdToken(idToken) as {
		sub: string;
		email: string;
		name: string;
	};

	console.log('claims', claims);

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
