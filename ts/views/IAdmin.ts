import { IUser } from "./IUser";
export type IAdmin = Omit<IUser, "Admin" | "Client" | "Moderator" | "AdminId" | "ClientId" | "ModeratorId"> & {
	id?: string;
	createdAt?: Date;
	updatedAt?: Date;
	display?: string;
	UserType?: 'Admin';

}
export const keysofIAdmin: (keyof IAdmin)[] = ["id", "createdAt", "updatedAt", "display", "UserType"]
