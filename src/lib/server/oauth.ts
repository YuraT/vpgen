import { Authentik } from 'arctic';
import * as env from '$env/static/private';

export const authentik = new Authentik(
	env.AUTH_DOMAIN,
	env.AUTH_CLIENT_ID,
	env.AUTH_CLIENT_SECRET,
	env.AUTH_REDIRECT_URI
);
