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

// If signed in user visits Login page, redirect them to home
export const load: PageServerLoad = async (event) => {
	const user = event.locals.user;

	// if user is already logged in & verified, redirect them to home
	if (user && user.isEmailVerified) {
		redirect(302, '/');
	}

	// if user is already logged in & not verified, redirect them to email verification
	if (user && !user.isEmailVerified) {
		redirect(302, '/email-verification');
	}
	return {
		form: await superValidate(zod(loginSchema))
	};
};

export const actions: Actions = {
	default: async (event) => {
		// Get form data and validate it
		const form = await superValidate(event, zod(loginSchema));

		// If form data is invalid, return error message
		if (!form.valid) {
			return message(form, {
				status: 'error',
				text: 'There was a problem with your submission.'
			});
		}

		// Check for existing user with email
		const existingUser = await checkIfUserExists(form.data.email);

		// Handle non-existent email to avoid revealing valid emails
		if (!existingUser) {
			return setError(
				form,
				'email',
				'Invalid email or password. Please double-check your credentials and try again.'
			);
		}

		let isPasswordValid = false;

		// Verify password if user uses email authentication and has a password
		if (existingUser.authMethods.includes('email') && existingUser.password) {
			isPasswordValid = await new Argon2id().verify(existingUser.password, form.data.password);
		} else {
			// If the user doesn't have a password, they registered with OAuth
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

		// If password is not valid, return error message
		if (!isPasswordValid) {
			return setError(
				form,
				'password',
				'Invalid email or password. Please double-check your credentials and try again.'
			);
		}

		// Create Lucia session and set session cookie for authenticated user
		const session = await lucia.createSession(existingUser.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		// Redirect user to protected route
		redirect(302, '/');
	}
};
