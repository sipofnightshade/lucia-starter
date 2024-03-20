// src/hooks.server.ts
import { lucia } from '$lib/server/luciaAuth'; // Import auth provider
import type { Handle } from '@sveltejs/kit'; // Type for Handle function

export const handle: Handle = async ({ event, resolve }) => {
	// Get session ID from cookie
	const sessionId = event.cookies.get(lucia.sessionCookieName);

	// ❌ If NO session ID, set user and session to null and continue
	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;

		// Continue processing the request
		return resolve(event);
	}

	// Validate session with Lucia
	const { session, user } = await lucia.validateSession(sessionId);

	// ✅ If Valid session, update cookie and set user/session in locals
	if (session && session.fresh) {
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
	}

	// ❌ If invalid session, set a blank cookie
	if (!session) {
		const sessionCookie = lucia.createBlankSessionCookie();
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
	}

	// Regardless of whether a valid session was found or not,
	// Set user and session data in locals for access in routes
	event.locals.user = user;
	event.locals.session = session;

	// Continue processing the request
	return resolve(event);
};
