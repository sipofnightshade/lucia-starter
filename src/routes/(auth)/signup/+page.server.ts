// routes/signup/+page.server.ts
import { lucia } from '$lib/server/luciaAuth';
import { fail, redirect } from '@sveltejs/kit';
import { generateId } from 'lucia';
import { Argon2id } from 'oslo/password';
import { db } from '$lib/server/db';

import type { Actions, PageServerLoad } from './$types';
import { userTable } from '$lib/server/schema';

// If signed in user visits Signup page, redirect them to home
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
		// username must be between 4 ~ 31 characters, and only consists of lowercase letters, 0-9, -, and _
		// keep in mind some database (e.g. mysql) are case insensitive
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

		// 4. Generate unique user ID and hash password
		const userId = generateId(15);
		const hashedPassword = await new Argon2id().hash(password);

		// 5. (TODO: Implement username existence check)
		// This step is currently missing but should be implemented to prevent duplicate usernames.

		// 6. Insert user data into database
		await db.insert(userTable).values({
			id: userId,
			username: username,
			hashedPassword: hashedPassword
		});

		// 7. Create Lucia session and cookie
		const session = await lucia.createSession(userId, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		// 8. Redirect user to home page after successful signup
		redirect(302, '/');
	}
};
