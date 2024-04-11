// lucia auth
import { lucia } from '$lib/server/luciaAuth';
import { generateId } from 'lucia';
import { Argon2id } from 'oslo/password';
// superforms
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
// sveltekit
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
// database
import { signupSchema } from '$lib/validation/authSchema';
import { checkIfUserExists, createUser } from '$lib/server/db_utils/user';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { userTable } from '$lib/server/schema';
import {
	generateVerificationCode,
	sendVerificationCode
} from '$lib/server/auth_utils/emailVerificationCodes';
import { createSession } from '$lib/server/auth_utils/sessions';

// If signed in user visits Signup page, redirect them to home
export const load: PageServerLoad = async (event) => {
	const user = event.locals.user;

	if (user && !user.isEmailVerified) redirect(302, '/email-verification');
	if (user && user.isEmailVerified) redirect(302, '/');

	return {
		form: await superValidate(zod(signupSchema))
	};
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const form = await superValidate(request, zod(signupSchema));

		if (!form.valid) {
			return message(form, {
				status: 'error',
				text: 'Please check your entries, the form contains invalid data'
			});
		}

		try {
			const userEmail = form.data.email;
			const existingUser = await checkIfUserExists(userEmail);
			if (existingUser && existingUser.authMethods.includes('email')) {
				return message(form, {
					status: 'error',
					text: 'This email is already in use. Please use a different email address.'
				});
			}

			const userId = existingUser?.id ?? generateId(15);

			const hashedPassword = await new Argon2id().hash(form.data.password);

			// Create or update user based on existence
			if (!existingUser) {
				await createUser({
					id: userId,
					name: form.data.name,
					email: userEmail,
					isEmailVerified: false,
					password: hashedPassword,
					authMethods: ['email']
				});
			} else {
				await db
					.update(userTable)
					.set({
						password: hashedPassword
					})
					.where(eq(userTable.email, userEmail));
			}

			// Generate email verification code & send to user's email
			const verificationCode = await generateVerificationCode(userId, userEmail);
			const sendVerificationCodeResult = await sendVerificationCode(userEmail, verificationCode);

			// If sending verification code fails, return error
			if (!sendVerificationCodeResult.result) {
				return message(form, {
					status: 'error',
					text: sendVerificationCodeResult.message
				});
			}

			// Create Lucia session and set session cookie
			const session = await lucia.createSession(userId, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});

			await createSession(lucia, userId, cookies);

			// Redirect user to home page after successful signup
			// Note: Redirect is also handled in the load function
			redirect(302, '/');
		} catch (error) {
			// Return error message if an error occurs during processing
			return message(form, {
				status: 'error',
				text: 'An error occurred while processing your request. Please try again.'
			});
		}
	}
};
