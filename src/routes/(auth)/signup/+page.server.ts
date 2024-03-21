// lucia auth
import { lucia } from '$lib/server/luciaAuth';
import { generateId } from 'lucia';
import { Argon2id } from 'oslo/password';
// superforms
import { message, setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
// sveltekit
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
// database
import { signupSchema } from '$lib/validation/authSchema';
import { checkIfEmailExists, createUser } from '$lib/server/dbUtils';

// If signed in user visits Signup page, redirect them to home
export const load: PageServerLoad = async (event) => {
	if (event.locals.user) redirect(302, '/');

	return {
		form: await superValidate(zod(signupSchema))
	};
};

export const actions: Actions = {
	default: async (event) => {
		// Get form data and validate it
		const form = await superValidate(event, zod(signupSchema));

		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		// Generate unique user ID and hash password
		const userId = generateId(15);
		const hashedPassword = await new Argon2id().hash(form.data.password);

		try {
			const isEmailAlreadyRegistered = await checkIfEmailExists(form.data.email);
			if (isEmailAlreadyRegistered === true) {
				return setError(form, 'email', 'Email already in use.');
			}

			await createUser({
				id: userId,
				name: form.data.name,
				email: form.data.email,
				password: hashedPassword
			});

			// Create Lucia session and cookie
			const session = await lucia.createSession(userId, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});

			// Redirect user to home page after successful signup
			redirect(302, '/');
		} catch (error) {
			return message(form, {
				alertType: 'error',
				alertText: 'An error occurred while processing your request. Please try again.'
			});
		}
	}
};
