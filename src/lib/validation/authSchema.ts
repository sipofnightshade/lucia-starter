import { z } from 'zod';

export const MIN_NAME_LENGTH = 2;
export const MAX_NAME_LENGTH = 50;
export const NAME_MIN_ERROR_MESSAGE = `Name must be at least ${MIN_NAME_LENGTH} characters long`;
export const NAME_MAX_ERROR_MESSAGE = `Name must be less than ${MAX_NAME_LENGTH} characters long`;

export const MAX_EMAIL_LENGTH = 254;
export const EMAIL_MAX_ERROR_MESSAGE = `Email must be less than ${MAX_EMAIL_LENGTH} characters long`;
export const EMAIL_VERIFICATION_CODE_LENGTH = 8;

export const MIN_PASSWORD_LENGTH = 2;
export const MAX_PASSWORD_LENGTH = 128;
export const PASSWORD_MIN_ERROR_MESSAGE = `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`;
export const PASSWORD_MAX_ERROR_MESSAGE = `Password must be less than ${MAX_PASSWORD_LENGTH} characters long`;

export const signupSchema = z.object({
	name: z
		.string()
		.min(MIN_NAME_LENGTH, NAME_MIN_ERROR_MESSAGE)
		.max(MAX_NAME_LENGTH, NAME_MAX_ERROR_MESSAGE),
	email: z.string().email('Invalid email format').trim(),
	password: z
		.string()
		.min(MIN_PASSWORD_LENGTH, PASSWORD_MIN_ERROR_MESSAGE)
		.max(MAX_PASSWORD_LENGTH, PASSWORD_MAX_ERROR_MESSAGE)
});

export const loginSchema = z.object({
	email: z.string().email('Invalid email format').trim(),
	password: z.string()
});

export const emailVerificationCodeSchema = z.object({
	verificationCode: z.string().length(EMAIL_VERIFICATION_CODE_LENGTH)
});

export type SignupSchema = typeof signupSchema;
export type LoginSchema = typeof loginSchema;
export type EmailVerificationCodeSchema = typeof emailVerificationCodeSchema;
