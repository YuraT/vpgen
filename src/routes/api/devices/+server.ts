import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createDevice, findDevices, mapDeviceToDetails } from '$lib/server/devices';

export const GET: RequestHandler = async (event) => {
	if (!event.locals.user) {
		return error(401, 'Unauthorized');
	}

	const devices = await findDevices(event.locals.user.id);
	return new Response(
		JSON.stringify({
			devices: devices.map(mapDeviceToDetails),
		}),
	);
};


export type Devices = Awaited<ReturnType<typeof findDevices>>;

export const POST: RequestHandler = async (event) => {
	if (!event.locals.user) {
		return error(401, 'Unauthorized');
	}
	const { name } = await event.request.json();
	const res = await createDevice({
		name,
		user: event.locals.user,
	});

	switch (res._tag) {
		case 'ok': {
			return new Response(null, {
				status: 201,
			});
		}
		case 'err': {
			const [status, message] = res.error;
			return error(status, message);
		}
	}
};
