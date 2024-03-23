import type { RequestHandler } from './$types';
import { OAuth2RequestError } from 'arctic';
import { and, eq } from 'drizzle-orm';
import { generateId } from 'lucia';

import {
	GOOGLE_OAUTH_CODE_VERIFIER_COOKIE_NAME,
	GOOGLE_OAUTH_STATE_COOKIE_NAME,
	createSession
} from '$lib/server/luciaAuthUtils';
import { db } from '$lib/server/db';
import { googleOauth, lucia } from '$lib/server/luciaAuth';
import { oauthAccountsTable, userTable } from '$lib/server/schema';

// Define the structure of a Google user
type GoogleUser = {
	sub: string;
	name: string;
	given_name: string;
	family_name: string;
	picture: string;
	email: string;
	email_verified: boolean;
	locale: string;
};

// Handler for GET request
export const GET: RequestHandler = async (event) => {
	// Extract code and state parameters from the request URL
	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');

	// Retrieve stored state and code verifier from cookies
	const storedState = event.cookies.get(GOOGLE_OAUTH_STATE_COOKIE_NAME);
	const storedCodeVerifier = event.cookies.get(GOOGLE_OAUTH_CODE_VERIFIER_COOKIE_NAME);

	// Validate OAuth state and code verifier
	if (!code || !state || !storedState || !storedCodeVerifier || state !== storedState) {
		return new Response('Invalid OAuth state or code verifier', {
			status: 400
		});
	}

	try {
		// Exchange authorization code for access tokens and fetch user info
		const tokens = await googleOauth.validateAuthorizationCode(code, storedCodeVerifier);
		const googleUserResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`
			}
		});

		const googleUser = (await googleUserResponse.json()) as GoogleUser;

		// Check if the user has a primary email address
		if (!googleUser.email) {
			return new Response('No primary email address', {
				status: 400
			});
		}

		// Check if the user's email is verified
		if (!googleUser.email_verified) {
			return new Response('Unverified email', {
				status: 400
			});
		}

		// Check if the user already exists in the database
		const [existingUser] = await db
			.select()
			.from(userTable)
			.where(eq(userTable.email, googleUser.email));

		if (existingUser) {
			// Check if the user already has a Google OAuth account linked
			const [existingOauthAccount] = await db
				.select()
				.from(oauthAccountsTable)
				.where(
					and(
						eq(oauthAccountsTable.providerId, 'google'),
						eq(oauthAccountsTable.providerUserId, googleUser.sub)
					)
				);

			if (!existingOauthAccount) {
				// Add the 'google' auth provider to the user's authMethods list
				const authMethods = existingUser.authMethods || [];
				authMethods.push('google');

				// Transaction: Link Google OAuth account to the existing user and update authMethods
				await db.transaction(async (trx) => {
					await trx.insert(oauthAccountsTable).values({
						userId: existingUser.id,
						providerId: 'google',
						providerUserId: googleUser.sub
					});

					await trx
						.update(userTable)
						.set({
							authMethods
						})
						.where(eq(userTable.id, existingUser.id));
				});
			}

			// Create a session for the existing user
			await createSession(lucia, existingUser.id, event.cookies);
		} else {
			const userId = generateId(15);

			// Transaction: Create a new user and their OAuth account
			await db.transaction(async (trx) => {
				await trx.insert(userTable).values({
					id: userId,
					name: googleUser.name,
					avatarUrl: googleUser.picture,
					email: googleUser.email,
					isEmailVerified: true,
					authMethods: ['google']
				});

				await trx.insert(oauthAccountsTable).values({
					userId,
					providerId: 'google',
					providerUserId: googleUser.sub
				});
			});

			// Create a session for the new user
			await createSession(lucia, userId, event.cookies);
		}

		// Redirect the user after successful authentication
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/'
			}
		});
	} catch (error) {
		console.error(error);

		// Handle specific error scenarios
		if (error instanceof OAuth2RequestError) {
			// OAuth2 request error (e.g., invalid code)
			return new Response(null, {
				status: 400
			});
		}

		return new Response(null, {
			status: 500
		});
	}
};
