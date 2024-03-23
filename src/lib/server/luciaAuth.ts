// lucia
import { Lucia } from 'lucia';
import { GitHub, Google } from 'arctic';
// database
import { dev } from '$app/environment';
import { db } from './db';
import { userTable, sessionTable } from './schema';
import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';
import {
	GITHUB_CLIENT_ID,
	GITHUB_CLIENT_SECRET,
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET
} from '$env/static/private';

const adapter = new DrizzleSQLiteAdapter(db, sessionTable, userTable); // your adapter

const googleRedirectUrl = `http://localhost:5173/login/google/callback`;

export const githubOauth = new GitHub(GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET);
export const googleOauth = new Google(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, googleRedirectUrl);

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			// set to `true` when using HTTPS
			secure: !dev
		}
	},
	getUserAttributes: (attributes) => {
		return {
			// attributes has the type of DatabaseUserAttributes below
			name: attributes.name,
			email: attributes.email,
			isEmailVerified: attributes.isEmailVerified,
			authMethods: attributes.authMethods,
			avatarUrl: attributes.avatarUrl
		};
	}
});

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: DatabaseUserAttributes;
	}
}

interface DatabaseUserAttributes {
	name: string;
	email: string;
	isEmailVerified: boolean;
	authMethods: string[];
	avatarUrl: string;
}
