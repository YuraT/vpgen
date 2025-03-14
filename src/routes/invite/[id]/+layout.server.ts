import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { isValidInviteToken } from '$lib/server/auth';

export const load: LayoutServerLoad = ({ params }) => {
	if (!isValidInviteToken(params.id)) redirect(307, '/')
};
