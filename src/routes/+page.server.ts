import { lucia } from '$lib/server/luciaAuth';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
// superforms
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { loginSchema, signupSchema } from '$lib/validation/authSchema';

export const load = (async (event) => {
	const user = await event.locals.user;

	const loginForm = await superValidate(zod(loginSchema));
	const signupForm = await superValidate(zod(signupSchema));

	return { loginForm, signupForm, user };
}) satisfies PageServerLoad;

export const actions: Actions = {
	logout: async (event) => {
		// 1. Check if user is authenticated (session exists in locals)
		if (!event.locals.session) {
			return fail(401, { message: 'Unauthorized' }); // Unauthorized if not logged in
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
