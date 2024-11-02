import { type Handle, redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import * as auth from '$lib/server/auth';
import { sequence } from '@sveltejs/kit/hooks';

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


const authRequired = new Set([
	'/user',
	'/connections',
]);
const handleProtectedPaths: Handle = ({ event, resolve }) => {
	if (authRequired.has(event.url.pathname) && !event.locals.user) {
		return redirect(302, '/');
	}
	return resolve(event);
}

export const handle: Handle = sequence(handleAuth, handleProtectedPaths);
