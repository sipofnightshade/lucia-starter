import { sql } from 'drizzle-orm';
import { text, integer, sqliteTable, primaryKey } from 'drizzle-orm/sqlite-core';

export const userTable = sqliteTable('user', {
	id: text('id').notNull().primaryKey(),
	name: text('name').notNull(),
	avatarUrl: text('avatar_url'),
	email: text('email').notNull().unique(),
	isEmailVerified: integer('is_email_verified', { mode: 'boolean' }).notNull().default(false),
	password: text('password'),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
	authMethods: text('auth_methods', { mode: 'json' }).$type<string[]>().notNull()
});

export const sessionTable = sqliteTable('session', {
	id: text('id').notNull().primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => userTable.id),
	expiresAt: integer('expires_at').notNull()
});

export const emailVerificationCodesTable = sqliteTable('email_verification_codes', {
	id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
	userId: text('user_id')
		.notNull()
		.references(() => userTable.id),
	code: text('code').notNull(),
	email: text('email').notNull(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export const oauthAccountsTable = sqliteTable(
	'oauth_accounts',
	{
		userId: text('user_id')
			.notNull()
			.references(() => userTable.id, {
				onDelete: 'cascade'
			}),

		providerId: text('provider_id').notNull(),
		providerUserId: text('provider_user_id').notNull()
	},
	(table) => ({
		pk: primaryKey({ columns: [table.providerId, table.providerUserId] })
	})
);

export type UserInsertSchema = typeof userTable.$inferInsert;
