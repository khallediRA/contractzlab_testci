import { IUser } from "./IUser";
export type IModerator = Omit<IUser, "Moderator" | "Admin" | "Client" | "ModeratorId" | "AdminId" | "ClientId"> & {
	id?: string;
	createdAt?: Date;
	updatedAt?: Date;
	display?: string;
	UserType?: 'Moderator';

}
export const keysofIModerator: (keyof IModerator)[] = ["id", "createdAt", "updatedAt", "display", "UserType"]
