// import { redirect } from '@sveltejs/kit';
// import type { RequestHandler } from './$types';
// import { lucia } from '$lib/server/luciaAuth';

// export const POST: RequestHandler = async (event) => {
// 	if (!event.locals.session) {
// 		redirect(302, '/');
// 	}

// 	// Invalidate the user's session using Lucia library
// 	await lucia.invalidateSession(event.locals.session.id);

// 	// Create and set a blank session cookie to clear client-side session data
// 	const sessionCookie = lucia.createBlankSessionCookie();
// 	event.cookies.set(sessionCookie.name, sessionCookie.value, {
// 		path: '.',
// 		...sessionCookie.attributes
// 	});

// 	// Redirect user to the home page after logout
// 	redirect(302, '/');
// };
