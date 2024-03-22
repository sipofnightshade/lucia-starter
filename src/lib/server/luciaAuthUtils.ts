import { RESEND_API_KEY } from '$env/static/private';
import type { Cookies } from '@sveltejs/kit';

import { eq } from 'drizzle-orm';
import { TimeSpan, type Lucia } from 'lucia';
import { createDate, isWithinExpirationDate } from 'oslo';
import { alphabet, generateRandomString } from 'oslo/crypto';
import { Resend } from 'resend';

import { EMAIL_VERIFICATION_CODE_LENGTH } from '$lib/validation/authSchema';
import { db } from './db';
import { emailVerificationCodesTable } from './schema';

const resend = new Resend(RESEND_API_KEY);

export const PENDING_USER_VERIFICATION_COOKIE_NAME = 'pendingUserVerification';
export type PendingVerificationUserDataType = {
	id: string;
	email: string;
};

// Creates and sets session
export const createSession = async (lucia: Lucia, userId: string, cookies: Cookies) => {
	const session = await lucia.createSession(userId, {});
	const sessionCookie = lucia.createSessionCookie(session.id);

	cookies.set(sessionCookie.name, sessionCookie.value, {
		path: '.',
		...sessionCookie.attributes
	});
};

// deletes session cookie
export const deleteSession = async (lucia: Lucia, cookies: Cookies) => {
	const sessionCookie = lucia.createBlankSessionCookie();

	cookies.set(sessionCookie.name, sessionCookie.value, {
		path: '.',
		...sessionCookie.attributes
	});
};

export const generateVerificationCode = async (userId: string, email: string) => {
	const code = generateRandomString(EMAIL_VERIFICATION_CODE_LENGTH, alphabet('0-9'));

	// This transaction block ensures atomicity and data integrity. If an error occurs while inserting the new code, the transaction will be rolled back, preventing the deletion of old verification codes. This maintains the state of the db.
	await db.transaction(async (trx) => {
		// Delete any existing verification codes for the user
		await trx
			.delete(emailVerificationCodesTable)
			.where(eq(emailVerificationCodesTable.userId, userId));

		// Insert the new verification code
		await trx.insert(emailVerificationCodesTable).values({
			userId: userId,
			email,
			code,
			expiresAt: createDate(new TimeSpan(5, 'm')) // 5 minutes
		});
	});

	return code;
};

export const sendVerificationCode = async (email: string, code: string) => {
	const { error } = await resend.emails.send({
		from: 'Lucia starter <onboarding@resend.dev>',
		to: [email],
		subject: 'Email Verification Code',
		html: `<p>Your email verification code is: <strong>${code}</strong></p>`
	});

	if (error) {
		console.error({ error });
		return { result: false, message: 'Failed to send email verification code.' };
	}

	return { result: true, message: 'Email verification code sent successfully.' };
};

export const verifyVerificationCode = async (userId: string, code: string) => {
	const [verificationCode] = await db
		.select()
		.from(emailVerificationCodesTable)
		.where(eq(emailVerificationCodesTable.userId, userId));

	// If there's no verification code for the user in the db
	if (!verificationCode) {
		return { result: false, message: 'Verification code not found.' };
	}

	// If the provided code doesn't match the one in the db
	if (verificationCode.code !== code) {
		return { result: false, message: 'The provided verification code is incorrect.' };
	}

	// If the verification code has expired
	if (!isWithinExpirationDate(verificationCode.expiresAt)) {
		return {
			result: false,
			message: 'The verification code has expired, please request a new one.'
		};
	}

	// If everything is okay, delete the verification code from the db
	await db
		.delete(emailVerificationCodesTable)
		.where(eq(emailVerificationCodesTable.userId, userId));

	// Return a success message
	return { result: true, message: 'Email verification successful!' };
};
