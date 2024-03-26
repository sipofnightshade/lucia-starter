import { lucia } from '$lib/server/luciaAuth';
import { redirect, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
	default: async (event) => {
		// 1. Check if user is authenticated (session exists in locals)
		if (!event.locals.session) {
			redirect(302, '/login');
		}

		// 2. Invalidate the user's session using Lucia library
		await lucia.invalidateSession(event.locals.session.id);

		// 3. Create and set a blank session cookie to clear client-side session data
		const sessionCookie = lucia.createBlankSessionCookie();
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		// 4. Redirect user to the home page after logout
		redirect(302, '/');
	}
};
