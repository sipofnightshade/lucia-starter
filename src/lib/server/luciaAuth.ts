// src/lib/server/auth.ts
import { Lucia } from 'lucia';
import { dev } from '$app/environment';
import { db } from './db';
import { userTable, sessionTable } from './schema';
import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';

const adapter = new DrizzleSQLiteAdapter(db, sessionTable, userTable); // your adapter

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
			username: attributes.username
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
	username: string;
}
