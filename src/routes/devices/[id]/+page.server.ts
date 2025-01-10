import { error, redirect } from '@sveltejs/kit';
import { deleteDevice } from '$lib/server/devices/delete';
import type { Actions } from './$types';

export const actions = {
	delete: async (event) => {
		if (!event.locals.user) return error(401, 'Unauthorized');

		const deviceId = Number.parseInt(event.params.id);
		if (Number.isNaN(deviceId)) return error(400, 'Invalid device id');

		const res = await deleteDevice(event.locals.user.id, deviceId);
		switch (res._tag) {
			case 'ok': {
				return redirect(303, '/devices');
			}
			case 'err': {
				const [status, message] = res.error;
				return error(status, message);
			}
		}
	},
} satisfies Actions;
