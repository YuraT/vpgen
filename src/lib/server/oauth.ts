import type { AuthProvider } from '$lib/auth';
import { authentik, google } from '$lib/server/oauth-providers';

export interface IOAuthClaims {
	sub: string;
	name: string;
	username: string;
}

export interface IOAuthProvider {
	readonly requireInvite: boolean;
	createAuthorizationURL(state: string, codeVerifier: string): URL;
	validateAuthorizationCode(code: string, codeVerifier: string): Promise<IOAuthClaims>;
}

export const oauthProviders: Record<AuthProvider, IOAuthProvider> = {
	authentik,
	google,
};
