import { is } from 'typia';
import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { type AuthProvider, enabledAuthProviders } from '$lib/auth';
import { oauthProviders } from '$lib/server/oauth';
import { ArcticFetchError, OAuth2RequestError } from 'arctic';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { createSession, isValidInviteToken, setSessionTokenCookie } from '$lib/server/auth';

export const load: PageServerLoad = async ({ params: { provider }, url, cookies }) => {
	if (!is<AuthProvider>(provider) || !enabledAuthProviders[provider]) {
		error(404);
	}

	const oauthProvider = oauthProviders[provider];
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const storedState = cookies.get(`${provider}_oauth_state`) ?? null;
	const codeVerifier = cookies.get(`${provider}_code_verifier`) ?? null;

	if (code === null || state === null || storedState === null || codeVerifier === null) {
		error(400, 'Missing url parameters');
	}

	const stateGeneratedToken = state.slice(0, storedState.length);
	const stateInviteToken = state.slice(storedState.length);
	if (stateGeneratedToken !== storedState) {
		error(400, 'Invalid state in url');
	}

	let claims;
	try {
		claims = await oauthProvider.validateAuthorizationCode(code, codeVerifier);
	} catch (e) {
		if (e instanceof OAuth2RequestError) {
			console.debug('Arctic: OAuth: invalid authorization code, credentials, or redirect URI', e);
			error(400, 'Invalid authorization code');
		}
		if (e instanceof ArcticFetchError) {
			console.debug('Arctic: failed to call `fetch()`', e);
			error(400, 'Failed to validate authorization code');
		}
		console.error('Unexpected error validating authorization code', code, e);
		error(500);
	}

	const existingUser = await db.query.users.findFirst({ where: eq(table.users.id, claims.sub) });

	if (existingUser) {
		const session = await createSession(existingUser.id);
		setSessionTokenCookie(cookies, session.id, session.expiresAt);
		redirect(302, '/');
	}

	if (oauthProvider.requireInvite && !isValidInviteToken(stateInviteToken)) {
		const message =
			stateInviteToken.length === 0 ? 'sign up with an invite link first' : 'invalid invite link';
		error(403, 'Not Authorized: ' + message);
	}

	const user: table.User = {
		id: claims.sub,
		authSource: provider,
		username: claims.username,
		name: claims.name,
	};
	await db.insert(table.users).values(user);
	console.log('created user', user, 'using provider', provider, 'with invite token', stateInviteToken);

	const session = await createSession(user.id);
	setSessionTokenCookie(cookies, session.id, session.expiresAt);

	redirect(302, '/');
};
