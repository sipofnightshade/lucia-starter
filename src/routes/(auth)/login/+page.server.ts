// sveltekit
import type { Actions, PageServerLoad } from './$types';
// lucia auth
import { lucia } from '$lib/server/luciaAuth';
import { redirect } from '@sveltejs/kit';
import { Argon2id } from 'oslo/password';
// database
import { loginSchema } from '$lib/validation/authSchema';
// superforms
import { message, setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { checkIfUserExists } from '$lib/server/db_utils/user';
import { createSession } from '$lib/server/auth_utils/sessions';

export const load: PageServerLoad = async (event) => {
	const user = event.locals.user;
	if (user && user.isEmailVerified) redirect(302, '/');
	if (user && !user.isEmailVerified) redirect(302, '/email-verification');

	return {
		form: await superValidate(zod(loginSchema))
	};
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(loginSchema));
		if (!form.valid) {
			return message(form, {
				status: 'error',
				text: 'There was a problem with your submission.'
			});
		}

		const existingUser = await checkIfUserExists(form.data.email);
		if (!existingUser) {
			return setError(
				form,
				'email',
				'Invalid email or password. Please double-check your credentials and try again.'
			);
		}

		let isPasswordValid = false;

		if (existingUser.authMethods.includes('email') && existingUser.password) {
			isPasswordValid = await new Argon2id().verify(existingUser.password, form.data.password);
		} else {
			return message(
				form,
				{
					status: 'error',
					text: 'Invalid email or password. Please double-check your credentials and try again.'
				},
				{
					status: 403
					// This status code indicates that the server understood the request,
					// but it refuses to authorize it because the user registered with OAuth
				}
			);
		}

		if (!isPasswordValid) {
			return setError(
				form,
				'password',
				'Invalid email or password. Please double-check your credentials and try again.'
			);
		}

		// Create Lucia session and set session cookie for authenticated user
		await createSession(lucia, existingUser.id, event.cookies);

		// Redirect user to protected route
		redirect(302, '/');
	}
};
