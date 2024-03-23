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
import { checkIfUserExists, createUser } from '$lib/server/dbUtils';
import { generateVerificationCode, sendVerificationCode } from '$lib/server/luciaAuthUtils';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { userTable } from '$lib/server/schema';

// If signed in user visits Signup page, redirect them to home
export const load: PageServerLoad = async (event) => {
	const user = event.locals.user;

	if (user && !user.isEmailVerified) {
		redirect(302, '/email-verification');
	}

	if (user && user.isEmailVerified) {
		redirect(302, '/');
	}

	return {
		form: await superValidate(zod(signupSchema))
	};
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		// Get form data and validate it
		const form = await superValidate(request, zod(signupSchema));

		// If form data is invalid, return error message
		if (!form.valid) {
			return message(form, {
				status: 'error',
				text: 'Please check your entries, the form contains invalid data'
			});
		}

		try {
			// Extract user email from form data
			const userEmail = form.data.email;
			// Check if user already exists
			const existingUser = await checkIfUserExists(userEmail);

			// If user exists and uses email auth, return error
			if (existingUser && existingUser.authMethods.includes('email')) {
				return message(form, {
					status: 'error',
					text: 'This email is already in use. Please use a different email address.'
				});
			}

			// Generate or retrieve user ID
			const userId = existingUser?.id ?? generateId(15);

			// Hash the user's password
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

			// Generate email verification code
			const emailVerificationCode = await generateVerificationCode(userId, userEmail);

			// Send verification code to user's email
			const sendVerificationCodeResult = await sendVerificationCode(
				userEmail,
				emailVerificationCode
			);

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

			// Redirect user to home page after successful signup
			// Note: Redirect is handled in the load function
		} catch (error) {
			// Return error message if an error occurs during processing
			return message(form, {
				status: 'error',
				text: 'An error occurred while processing your request. Please try again.'
			});
		}
	}
};
