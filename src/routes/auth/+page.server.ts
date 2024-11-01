import { fail, redirect } from "@sveltejs/kit";
import { invalidateSession, deleteSessionTokenCookie } from "$lib/server/auth";
import type { Actions } from "./$types";

export const actions: Actions = {
	logout: async (event) => {
		if (event.locals.session === null) {
			return fail(401);
		}
		await invalidateSession(event.locals.session.id);
		deleteSessionTokenCookie(event);
		return redirect(302, "/");
	}
};
