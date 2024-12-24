import { createSession, setSessionTokenCookie } from "$lib/server/auth";
import { authentik } from "$lib/server/oauth";
import { decodeIdToken } from "arctic";

import type { RequestEvent } from "@sveltejs/kit";
import type { OAuth2Tokens } from "arctic";
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';

import * as table from '$lib/server/db/schema';

export async function GET(event: RequestEvent): Promise<Response> {
	const code = event.url.searchParams.get("code");
	const state = event.url.searchParams.get("state");
	const storedState = event.cookies.get("authentik_oauth_state") ?? null;
	const codeVerifier = event.cookies.get("authentik_code_verifier") ?? null;
	if (code === null || state === null || storedState === null || codeVerifier === null) {
		return new Response(null, {
			status: 400
		});
	}
	if (state !== storedState) {
		return new Response(null, {
			status: 400
		});
	}

	let tokens: OAuth2Tokens;
	try {
		tokens = await authentik.validateAuthorizationCode(code, codeVerifier);
	} catch (e) {
		// Invalid code or client credentials
		return new Response(null, {
			status: 400
		});
	}
	const claims = decodeIdToken(tokens.idToken()) as { sub: string, preferred_username: string, name: string };
	console.log("claims", claims);
	const userId: string = claims.sub;
	const username: string = claims.preferred_username;

	const existingUser = await db.query.users.findFirst({where: eq(table.users.id, userId)});

	if (existingUser) {
		const session = await createSession(existingUser.id);
		setSessionTokenCookie(event, session.id, session.expiresAt);
		return new Response(null, {
			status: 302,
			headers: {
				Location: "/"
			}
		});
	}

	const user: table.User = {
		id: userId,
		username,
		name: claims.name as string,
	};

	try {
		await db.insert(table.users).values(user);
		const session = await createSession(user.id);
		setSessionTokenCookie(event, session.id, session.expiresAt);
	} catch (e) {
		console.error('failed to create user', e);
		return new Response(null, {
			status: 500
		});
	}

	return new Response(null, {
		status: 302,
		headers: {
			Location: "/"
		}
	});
}
