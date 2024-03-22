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
	verifyCode: async ({ request, locals }) => {
		const user = locals.user;
		if (!user) redirect(302, '/signup');

		// Get form data and validate it
		const form = await superValidate(request, zod(emailVerificationCodeSchema));

		if (!form.valid) {
			return message(form, {
				status: 'error',
				text: 'Invalid verification code, please try again'
			});
		}

		const isCodeValid = await verifyVerificationCode(user.id, form.data.verificationCode);

		if (isCodeValid.result === false) {
			return message(form, {
				status: 'error',
				text: isCodeValid.message
			});
		}

		await db
			.update(userTable)
			.set({ isEmailVerified: true })
			.where(eq(userTable.email, user.email));

		redirect(302, '/');
	},

	sendNewCode: async ({ locals }) => {
		const user = locals.user;
		if (!user) return redirect(302, '/signup');

		const emailVerificationCode = await generateVerificationCode(user.id, user.email);

		const sendVerificationCodeResult = await sendVerificationCode(
			user.email,
			emailVerificationCode
		);

		if (!sendVerificationCodeResult.result) {
			return fail(500, {
				message: sendVerificationCodeResult.message
			});
		}

		return {
			message: sendVerificationCodeResult.message
		};

		// return { success: true };
	}
};
