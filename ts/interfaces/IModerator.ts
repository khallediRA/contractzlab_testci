import { IUser } from "./IUser";
export interface IModerator {
	id?: string;
	createdAt?: Date;
	updatedAt?: Date;
	User?: Omit<IUser, "Moderator" | "Admin" | "Client" | "ModeratorId" | "AdminId" | "ClientId">;

}
