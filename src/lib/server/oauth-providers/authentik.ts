import { envToBool } from '$lib/utils';
import { env } from '$env/dynamic/private';
import { Authentik, decodeIdToken } from 'arctic';
import { assertGuard } from 'typia';
import type { IOAuthProvider } from '$lib/server/oauth';

const authentikProvider = new Authentik(
	env.AUTH_AUTHENTIK_DOMAIN,
	env.AUTH_AUTHENTIK_CLIENT_ID,
	env.AUTH_AUTHENTIK_CLIENT_SECRET,
	`${env.ORIGIN}/auth/authentik/callback`,
);

export const authentik: IOAuthProvider = {
	requireInvite: envToBool(env.AUTH_AUTHENTIK_REQUIRE_INVITE, true),
	createAuthorizationURL: (state: string, codeVerifier: string) => {
		const scopes = ['openid', 'profile'];
		return authentikProvider.createAuthorizationURL(state, codeVerifier, scopes);
	},
	validateAuthorizationCode: async (code: string, codeVerifier: string) => {
		const tokens = await authentikProvider.validateAuthorizationCode(code, codeVerifier);
		const claims = decodeIdToken(tokens.idToken());
		assertGuard<{
			sub: string;
			name: string;
			preferred_username: string;
		}>(claims);
		return {
			sub: claims.sub,
			name: claims.name,
			username: claims.preferred_username,
		};
	},
};
