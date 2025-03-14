import { Authentik, Google } from 'arctic';
import { env } from '$env/dynamic/private';

export const authentik = new Authentik(
	env.AUTH_DOMAIN,
	env.AUTH_CLIENT_ID,
	env.AUTH_CLIENT_SECRET,
	`${env.ORIGIN}/auth/authentik/callback`,
);

export const google = new Google(
	env.GOOGLE_CLIENT_ID,
	env.GOOGLE_CLIENT_SECRET,
	`${env.ORIGIN}/auth/google/callback`,
);
