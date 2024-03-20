import { lucia } from '$lib/server/luciaAuth';
import { fail, redirect } from '@sveltejs/kit';
import { Argon2id } from 'oslo/password';
import { db } from '$lib/server/db';

import type { Actions, PageServerLoad } from './$types';
import { userTable } from '$lib/server/schema';
import { eq } from 'drizzle-orm';

// If signed in user visits Login page, redirect them to home
export const load: PageServerLoad = async (event) => {
	if (event.locals.user) redirect(302, '/');
};

export const actions: Actions = {
	default: async (event) => {
		// 1. Get username and password from form data
		const formData = await event.request.formData();
		const username = formData.get('username');
		const password = formData.get('password');

		// 2. Validate username format
		if (
			typeof username !== 'string' ||
			username.length < 3 ||
			username.length > 31 ||
			!/^[a-z0-9_-]+$/.test(username)
		) {
			return fail(400, {
				message: 'Invalid username'
			});
		}

		// 3. Validate password length
		if (typeof password !== 'string' || password.length < 6 || password.length > 255) {
			return fail(400, {
				message: 'Invalid password'
			});
		}

		// 4. Check for existing user with username (consider security implications in comments)
		const existingUser = await db.query.userTable.findFirst({
			where: eq(userTable.username, username)
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
		const validPassword = await new Argon2id().verify(existingUser.hashedPassword, password);
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
		redirect(302, '/protected');
	}
};
