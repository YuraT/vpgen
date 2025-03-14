import type { RequestHandler } from './$types';
import { generateCodeVerifier, generateState } from 'arctic';
import { google } from '$lib/server/oauth';

export const GET: RequestHandler = ({ url, cookies }) => {
	const inviteToken = url.searchParams.get('invite');

	const state = generateState();
	const codeVerifier = generateCodeVerifier();
	const scopes = ['openid', 'profile', 'email'];
	const authUrl = google.createAuthorizationURL(state, codeVerifier, scopes);

	cookies.set('google_oauth_state', state, {
		path: '/',
		httpOnly: true,
		maxAge: 60 * 10, // 10 minutes
		sameSite: 'lax',
	});
	cookies.set('google_code_verifier', codeVerifier, {
		path: '/',
		httpOnly: true,
		maxAge: 60 * 10, // 10 minutes
		sameSite: 'lax',
	});
	if (inviteToken !== null) cookies.set('invite_token', inviteToken, {
		path: '/',
		httpOnly: true,
		maxAge: 60 * 10, // 10 minutes
		sameSite: 'lax',
	});

	return new Response(null, {
		status: 302,
		headers: {
			Location: authUrl.toString(),
		},
	});
};
