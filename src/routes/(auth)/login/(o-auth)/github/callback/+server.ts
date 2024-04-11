import type { RequestHandler } from './$types';

import { OAuth2RequestError } from 'arctic';
import { and, eq } from 'drizzle-orm';
import { generateId } from 'lucia';

import { db } from '$lib/server/db';
import { githubOauth, lucia } from '$lib/server/luciaAuth';
import { oauthAccountsTable, userTable } from '$lib/server/schema';
import { GITHUB_OAUTH_STATE_COOKIE_NAME } from '$lib/server/auth_utils/cookies';
import { createSession } from '$lib/server/auth_utils/sessions';

type GitHubUser = {
	id: number;
	login: string;
	avatar_url: string;
	name: string;
};

type GitHubEmail = {
	email: string;
	primary: boolean;
	verified: boolean;
	visibility: string | null;
};

export const GET: RequestHandler = async (event) => {
	// Validate state and authorization code received from GitHub OAuth flow
	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');
	const storedState = event.cookies.get(GITHUB_OAUTH_STATE_COOKIE_NAME);

	// Validate OAuth state and code verifier
	if (!code || !state || !storedState || state !== storedState) {
		return new Response(null, {
			status: 400
		});
	}

	try {
		// Exchange authorization code for access tokens and fetch user info
		const tokens = await githubOauth.validateAuthorizationCode(code);
		const githubUserResponse = await fetch('https://api.github.com/user', {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`
			}
		});

		// Fetch the primary email address of the GitHub user
		const githubEmailResponse = await fetch('https://api.github.com/user/emails', {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`
			}
		});

		const githubUser = (await githubUserResponse.json()) as GitHubUser;
		const githubEmail = (await githubEmailResponse.json()) as GitHubEmail[];

		// Check for valid primary email address
		const primaryEmail = githubEmail.find((email) => email.primary) ?? null;

		if (!primaryEmail) {
			return new Response('No primary email address', {
				status: 400
			});
		}

		if (!primaryEmail.verified) {
			return new Response('Unverified email', {
				status: 400
			});
		}

		// Check if user already exists in the database
		const [existingUser] = await db
			.select()
			.from(userTable)
			.where(eq(userTable.email, primaryEmail.email));

		if (existingUser) {
			// ✅ Existing user - Link account if not already linked
			const [existingOauthAccount] = await db
				.select()
				.from(oauthAccountsTable)
				.where(
					and(
						eq(oauthAccountsTable.providerId, 'github'),
						eq(oauthAccountsTable.providerUserId, githubUser.id.toString())
					)
				);

			if (!existingOauthAccount) {
				// Add the 'github' auth provider to the user's authMethods list
				const authMethods = existingUser.authMethods || [];
				authMethods.push('github');

				await db.transaction(async (trx) => {
					// Link the GitHub OAuth account to the existing user
					await trx.insert(oauthAccountsTable).values({
						userId: existingUser.id,
						providerId: 'github',
						providerUserId: githubUser.id.toString()
					});

					// Update the user's authMethods list
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
			// ✅ New user - Create user and link GitHub account
			const userId = generateId(15);

			await db.transaction(async (trx) => {
				await trx.insert(userTable).values({
					id: userId,
					name: githubUser.name,
					avatarUrl: githubUser.avatar_url,
					email: primaryEmail.email,
					isEmailVerified: true,
					authMethods: ['github']
				});

				await trx.insert(oauthAccountsTable).values({
					userId,
					providerId: 'github',
					providerUserId: githubUser.id.toString()
				});
			});

			// Create a session for the new user
			await createSession(lucia, userId, event.cookies);
		}

		return new Response(null, {
			status: 302,
			headers: {
				Location: '/'
			}
		});
	} catch (error) {
		console.error(error);

		// the specific error message depends on the provider
		if (error instanceof OAuth2RequestError) {
			// invalid code
			return new Response(null, {
				status: 400
			});
		}

		return new Response(null, {
			status: 500
		});
	}
};
