import { type Handle, redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { dev } from '$app/environment';
import * as auth from '$lib/server/auth';
import wgProvider from '$lib/server/wg-provider';

await wgProvider.init();

const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get(auth.sessionCookieName);
	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await auth.validateSession(sessionId);
	if (session) {
		event.cookies.set(auth.sessionCookieName, session.id, {
			path: '/',
			sameSite: 'lax',
			httpOnly: true,
			expires: session.expiresAt,
			secure: !dev
		});
	} else {
		event.cookies.delete(auth.sessionCookieName, { path: '/' });
	}

	event.locals.user = user;
	event.locals.session = session;

	return resolve(event);
};


const authRequired = [
	/^\/api/,
	/^\/user/,
	/^\/connections/,
	/^\/devices/,
];
const handleProtectedPaths: Handle = ({ event, resolve }) => {
	const isProtected = authRequired.some((re) => re.test(event.url.pathname));

	if (!event.locals.user && isProtected) {
			return redirect(302, '/');
	}
	return resolve(event);
}

export const handle: Handle = sequence(handleAuth, handleProtectedPaths);
