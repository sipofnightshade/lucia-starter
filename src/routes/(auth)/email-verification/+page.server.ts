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
	sendCodeRateLimiter,
	sendVerificationCode,
	verifyCodeRateLimiter,
	verifyVerificationCode
} from '$lib/server/luciaAuthUtils';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	const { user } = event.locals;
	// redirect to signup if not signed in
	if (!user) redirect(302, '/signup');
	// redirect home if logged in and email already verified
	if (user.isEmailVerified) redirect(302, '/');

	return {
		form: await superValidate(zod(emailVerificationCodeSchema))
	};
};

export const actions: Actions = {
	verifyCode: async (event) => {
		const user = event.locals.user;
		if (!user) redirect(302, '/signup');

		const form = await superValidate(event, zod(emailVerificationCodeSchema));
		if (!form.valid) {
			return message(form, {
				status: 'error',
				text: 'Invalid verification code, please try again'
			});
		}

		const rateLimitStatus = await verifyCodeRateLimiter.check(event);
		if (rateLimitStatus.limited) {
			return message(
				form,
				{
					status: 'error',
					text: `You have made too many requests and exceeded the rate limit. Please try again after ${rateLimitStatus.retryAfter} seconds.`
				},
				{ status: 429 }
			);
		}

		const isCodeValid = await verifyVerificationCode(user.id, form.data.verificationCode);
		if (isCodeValid.result === false) {
			return message(form, {
				status: 'error',
				text: isCodeValid.message
			});
		}

		// Update user's email verification status and auth methods
		await db.transaction(async (trx) => {
			const [existingUser] = await trx
				.select()
				.from(userTable)
				.where(eq(userTable.email, user.email));

			const updatedAuthMethods = [...(existingUser?.authMethods ?? []), 'email'];

			await trx
				.update(userTable)
				.set({ isEmailVerified: true, authMethods: updatedAuthMethods })
				.where(eq(userTable.email, user.email));
		});

		// Redirect user to home page after successful verification
		redirect(302, '/');
	},

	sendNewCode: async (event) => {
		const rateLimitStatus = await sendCodeRateLimiter.check(event);
		if (rateLimitStatus.limited) {
			return fail(429, {
				message: `You have made too many requests and exceeded the rate limit. Please try again after ${rateLimitStatus.retryAfter} seconds.`
			});
		}

		const user = event.locals.user;
		if (!user) return redirect(302, '/signup');

		const generatedCode = await generateVerificationCode(user.id, user.email);
		const sendCodeResult = await sendVerificationCode(user.email, generatedCode);

		if (!sendCodeResult.result) {
			return fail(500, { message: sendCodeResult.message });
		}

		// Return success message
		return {
			message: sendCodeResult.message
		};
	}
};
