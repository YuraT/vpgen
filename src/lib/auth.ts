import { envToBool } from '$lib/utils';
import { env } from '$env/dynamic/public';

export type AuthProvider = 'authentik' | 'google';

export const enabledAuthProviders: Record<AuthProvider, boolean> = {
	authentik: envToBool(env.PUBLIC_AUTH_AUTHENTIK_ENABLE),
	google: envToBool(env.PUBLIC_AUTH_GOOGLE_ENABLE),
};
