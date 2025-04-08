import { generateCodeVerifier, generateState } from 'arctic';
import { oauthProviders } from '$lib/server/oauth';
import { is } from 'typia';
import { type AuthProvider, enabledAuthProviders } from '$lib/auth';

export async function GET({ params: { provider }, url, cookies }) {
	if (!is<AuthProvider>(provider) || !enabledAuthProviders[provider]) {
		return new Response(null, { status: 404 });
	}
	const oauthProvider = oauthProviders[provider];

	const inviteToken = url.searchParams.get('invite') ?? '';
	const state = generateState();
	const codeVerifier = generateCodeVerifier();
	const authUrl = oauthProvider.createAuthorizationURL(state + inviteToken, codeVerifier);

	cookies.set(`${provider}_oauth_state`, state, {
		path: '/',
		httpOnly: true,
		maxAge: 60 * 10, // 10 minutes
		sameSite: 'lax',
	});
	cookies.set(`${provider}_code_verifier`, codeVerifier, {
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
}
