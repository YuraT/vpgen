import type { Actions } from './$types';
import { createClient } from '$lib/server/clients';
import { error, redirect } from '@sveltejs/kit';

export const actions = {
	create: async (event) => {
		if (!event.locals.user) return error(401, 'Unauthorized');
		const formData = await event.request.formData();
		const name = formData.get('name');
		if (typeof name !== 'string' || name.trim() === '') return error(400, 'Invalid name');
		const res = await createClient({
			name: name.trim(),
			user: event.locals.user,
		});

		switch (res._tag) {
			case 'ok': {
				return redirect(303, `/clients/${res.value}`);
			}
			case 'err': {
				const [status, message] = res.error;
				return error(status, message);
			}
		}
	},
} satisfies Actions;
