import { decodeIdToken, Google } from 'arctic';
import { env } from '$env/dynamic/private';
import { envToBool } from '$lib/utils';
import { assertGuard } from 'typia';
import type { IOAuthProvider } from '$lib/server/oauth';

const googleProvider = new Google(
	env.AUTH_GOOGLE_CLIENT_ID,
	env.AUTH_GOOGLE_CLIENT_SECRET,
	`${env.ORIGIN}/auth/google/callback`,
);

export const google: IOAuthProvider = {
	requireInvite: envToBool(env.AUTH_GOOGLE_REQUIRE_INVITE, true),
	createAuthorizationURL: (state: string, codeVerifier: string) => {
		const scopes = ['openid', 'profile', 'email'];
		return googleProvider.createAuthorizationURL(state, codeVerifier, scopes);
	},
	validateAuthorizationCode: async (code: string, codeVerifier: string) => {
		const tokens = await googleProvider.validateAuthorizationCode(code, codeVerifier);
		const claims = decodeIdToken(tokens.idToken());
		assertGuard<{
			sub: string;
			email: string;
			name: string;
		}>(claims);
		return {
			sub: claims.sub,
			name: claims.name,
			username: claims.email,
		};
	},
};
