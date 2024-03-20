// lucia auth
import { lucia } from '$lib/server/luciaAuth';
import { generateId } from 'lucia';
import { Argon2id } from 'oslo/password';
// superforms
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
// sveltekit
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
// database
import { db } from '$lib/server/db';
import { userTable } from '$lib/server/schema';
import { signupSchema } from '$lib/validation/authSchema';

// If signed in user visits Signup page, redirect them to home
export const load: PageServerLoad = async (event) => {
	if (event.locals.user) redirect(302, '/');

	return {
		form: await superValidate(zod(signupSchema))
	};
};

export const actions: Actions = {
	default: async (event) => {
		// 1. Get form data and validate it
		const form = await superValidate(event, zod(signupSchema));

		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		// 3. Generate unique user ID and hash password
		const userId = generateId(15);
		const hashedPassword = await new Argon2id().hash(form.data.password);

		// 4. (TODO: Implement username existence check)
		// This step is currently missing but should be implemented to prevent duplicate usernames.

		// 5. Insert user data into database
		await db.insert(userTable).values({
			id: userId,
			username: form.data.username,
			hashedPassword: hashedPassword
		});

		// 6. Create Lucia session and cookie
		const session = await lucia.createSession(userId, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		// 7. Redirect user to home page after successful signup
		redirect(302, '/');
	}
};
