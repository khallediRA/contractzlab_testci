import { IUser } from "./IUser";
export interface IExternalToken {
	id?: number;
	UserType?: 'Admin' | 'Client' | 'Moderator';
	token?: string;
	ip?: string;
	expiresAt?: Date;
	type?: 'Google' | 'LinkedIn';
	createdAt?: Date;
	updatedAt?: Date;
	userId?: string;
	user?: Omit<IUser, "ExternalToken_as_user" | "ExternalToken_as_userId">;

}
