import type { Actions } from './$types';
import { createClient } from '$lib/server/clients';
import { error } from '@sveltejs/kit';

export const actions = {
	create: async (event) => {
		if (!event.locals.user) return error(401, 'Unauthorized');
		const name = 'New Client Name';
		const res = await createClient({
			name,
			user: event.locals.user,
		});

		switch (res._tag) {
			case 'ok': {
				return {
					status: 201,
				};
			}
			case 'err': {
				const [status, message] = res.error;
				return error(status, message);
			}
		}
	},
} satisfies Actions;
