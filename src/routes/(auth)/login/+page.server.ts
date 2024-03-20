// sveltekit
import type { Actions, PageServerLoad } from './$types';
// lucia auth
import { lucia } from '$lib/server/luciaAuth';
import { fail, redirect } from '@sveltejs/kit';
import { Argon2id } from 'oslo/password';
// database
import { db } from '$lib/server/db';
import { userTable } from '$lib/server/schema';
import { loginSchema } from '$lib/validation/authSchema';
import { eq } from 'drizzle-orm';
// superforms
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

// If signed in user visits Login page, redirect them to home
export const load: PageServerLoad = async (event) => {
	if (event.locals.user) redirect(302, '/');

	return {
		form: await superValidate(zod(loginSchema))
	};
};

export const actions: Actions = {
	default: async (event) => {
		// 1. Get form data and validate it
		const form = await superValidate(event, zod(loginSchema));

		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		// 4. Check for existing user with username (consider security implications in comments)
		const existingUser = await db.query.userTable.findFirst({
			where: eq(userTable.username, form.data.username)
		});

		// 5. Handle non-existent username (avoid revealing valid usernames)
		if (!existingUser) {
			// NOTE:
			// Returning immediately allows malicious actors to figure out valid usernames from response times,
			// allowing them to only focus on guessing passwords in brute-force attacks.
			// As a preventive measure, you may want to hash passwords even for invalid usernames.
			// However, valid usernames can be already be revealed with the signup page among other methods.
			// It will also be much more resource intensive.
			// Since protecting against this is none-trivial,
			// it is crucial your implementation is protected against brute-force attacks with login throttling etc.
			// If usernames are public, you may outright tell the user that the username is invalid.
			return fail(400, {
				message: 'Incorrect username or password'
			});
		}

		// 6. Verify password using secure hashing algorithm
		const validPassword = await new Argon2id().verify(
			existingUser.hashedPassword,
			form.data.password
		);
		if (!validPassword) {
			return fail(400, {
				message: 'Incorrect username or password'
			});
		}

		// 7. Create Lucia session and cookie for authenticated user
		const session = await lucia.createSession(existingUser.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		// 8. Redirect user to protected route
		redirect(302, '/');
	}
};
