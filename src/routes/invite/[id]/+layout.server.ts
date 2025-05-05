import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { isValidInviteToken } from '$lib/server/auth';

export const load: LayoutServerLoad = ({ params, locals }) => {
	if (!isValidInviteToken(params.id)) redirect(302, '/');
	if (locals.user !== null) redirect(302, '/');
};
