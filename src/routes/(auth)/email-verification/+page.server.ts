// superforms
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
// sveltekit
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
// database
import { emailVerificationCodeSchema } from '$lib/validation/authSchema';
import { db } from '$lib/server/db';
import { userTable } from '$lib/server/schema';
import {
	generateVerificationCode,
	sendVerificationCode,
	verifyCodeRateLimiter,
	verifyVerificationCode
} from '$lib/server/luciaAuthUtils';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) redirect(302, '/signup');

	return {
		form: await superValidate(zod(emailVerificationCodeSchema))
	};
};

export const actions: Actions = {
	verifyCode: async (event) => {
		// Retrieve user from event locals
		const user = event.locals.user;
		// If user is not logged in, redirect to signup page
		if (!user) redirect(302, '/signup');

		// Get form data and validate it
		const form = await superValidate(event, zod(emailVerificationCodeSchema));

		// If form data is invalid, return error message
		if (!form.valid) {
			return message(form, {
				status: 'error',
				text: 'Invalid verification code, please try again'
			});
		}

		// Check if rate limit for sending new code is exceeded
		const rateLimitResult = await verifyCodeRateLimiter.check(event);

		// If rate limit exceeded, return error message with rate limit information
		if (rateLimitResult.limited) {
			return message(
				form,
				{
					status: 'error',
					text: `You have made too many requests and exceeded the rate limit. Please try again after ${rateLimitResult.retryAfter} seconds.`
				},
				{
					status: 429
				}
			);
		}

		// Check if verification code is valid
		const isCodeValid = await verifyVerificationCode(user.id, form.data.verificationCode);

		// If verification code is invalid, return error message
		if (isCodeValid.result === false) {
			return message(form, {
				status: 'error',
				text: isCodeValid.message
			});
		}

		// Update user's email verification status and auth methods
		await db.transaction(async (trx) => {
			// Retrieve user from database
			const [existingUser] = await trx
				.select()
				.from(userTable)
				.where(eq(userTable.email, user.email));

			// Update user's auth methods to include email
			const authMethods = existingUser?.authMethods ?? [];
			authMethods.push('email');

			// Update user's email verification status and auth methods
			await trx
				.update(userTable)
				.set({ isEmailVerified: true, authMethods })
				.where(eq(userTable.email, user.email));
		});

		// Redirect user to home page after successful verification
		redirect(302, '/');
	},

	sendNewCode: async ({ locals }) => {
		// Retrieve user from locals
		const user = locals.user;

		// If user is not logged in, redirect to signup page
		if (!user) return redirect(302, '/signup');

		// Generate email verification code
		const emailVerificationCode = await generateVerificationCode(user.id, user.email);

		// Send verification code to user's email
		const sendVerificationCodeResult = await sendVerificationCode(
			user.email,
			emailVerificationCode
		);

		// If sending verification code fails, return error message
		if (!sendVerificationCodeResult.result) {
			return fail(500, {
				message: sendVerificationCodeResult.message
			});
		}

		// Return success message
		return {
			message: sendVerificationCodeResult.message
		};
	}
};
