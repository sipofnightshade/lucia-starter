import { z } from 'zod';

// export const signupSchema = z.object({
// 	name: z.string().min(1, 'Name is required'),
// 	email: z.string().email('Invalid email format').trim(),
// 	password: z.string().min(8, 'Password must be at least 8 characters')
// });

export const signupSchema = z.object({
	username: z.string().min(1, 'Username is required'),
	password: z.string().min(8, 'Password must be at least 8 characters')
});

export const loginSchema = z.object({
	// email: z.string().email('Invalid email format').trim(),
	username: z.string().min(1, 'Username is required'),
	password: z.string()
});

export type SignupSchema = typeof signupSchema;
export type LoginSchema = typeof loginSchema;
