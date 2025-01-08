import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { findDevice, mapDeviceToDetails } from '$lib/server/devices';

export const GET: RequestHandler = async (event) => {
	if (!event.locals.user) {
		return error(401, 'Unauthorized');
	}

	const { id } = event.params;
	const deviceId = parseInt(id);
	if (isNaN(deviceId)) {
		return error(400, 'Invalid device ID');
	}
	const device = await findDevice(event.locals.user.id, deviceId);
	if (!device) {
		return error(404, 'Device not found');
	}
	return new Response(JSON.stringify(mapDeviceToDetails(device)));
};
