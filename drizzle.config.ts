import * as dotenv from 'dotenv';
import type { Config } from 'drizzle-kit';

dotenv.config();
const { DB_URL, DB_AUTH_TOKEN } = process.env;

if (!DB_URL || !DB_AUTH_TOKEN) {
	throw new Error(
		'No DATABASE_URL defined in the environment variables. Please ensure it is set in the .env file.'
	);
}

export default {
	schema: 'src/lib/server/schema.ts',
	out: './migrations',
	driver: 'turso',
	dbCredentials: {
		url: DB_URL,
		authToken: DB_AUTH_TOKEN
	}
} satisfies Config;
