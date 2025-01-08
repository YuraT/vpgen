import type { PageLoad } from './$types';
import { type DeviceDetails, deviceDetailsToConfig } from '$lib/devices';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ fetch, params }) => {
	const res = await fetch(`/api/devices/${params.id}`);
	const resJson = await res.json();
	if (!res.ok) {
		return error(res.status, resJson['message']);
	}
	const device = resJson as DeviceDetails;
	const config = deviceDetailsToConfig(device);

	return { device, config };
};
