import type { PageLoad } from './$types';
import type { DeviceDetails } from '$lib/devices';

export const load: PageLoad = async ({ fetch }) => {
	const res = await fetch('/api/devices');
	const { devices } = await res.json() as { devices: DeviceDetails[] };

	return { devices };
};
