import { eq } from 'drizzle-orm';
import { db } from './db';
import { userTable, type UserInsertSchema } from './schema';

export const checkIfEmailExists = async (email: string) => {
	const queryResult = await db
		.select({
			email: userTable.email
		})
		.from(userTable)
		.where(eq(userTable.email, email));

	return queryResult.length > 0;
};

export const checkIfUserExists = async (email: string) => {
	const [existingUser] = await db
		.select({
			id: userTable.id,
			email: userTable.email,
			password: userTable.password,
			isEmailVerified: userTable.isEmailVerified,
			authMethods: userTable.authMethods
		})
		.from(userTable)
		.where(eq(userTable.email, email));

	return existingUser;
};

export const createUser = async (user: UserInsertSchema) => {
	return await db.insert(userTable).values(user);
};

export const getAllUsers = async () => {
	const queryResult = await db
		.select({
			id: userTable.id,
			name: userTable.name,
			email: userTable.email
		})
		.from(userTable);

	return queryResult;
};
