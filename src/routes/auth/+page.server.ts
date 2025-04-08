import { fail, redirect } from '@sveltejs/kit';
import { invalidateSession, deleteSessionTokenCookie } from '$lib/server/auth';
import type { Actions } from './$types';

export const actions: Actions = {
	logout: async ({ locals, cookies }) => {
		if (locals.session === null) {
			return fail(401);
		}
		await invalidateSession(locals.session.id);
		deleteSessionTokenCookie(cookies);
		redirect(302, '/');
	},
};
