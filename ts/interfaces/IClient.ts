import { IUser } from "./IUser";
export interface IClient {
	id?: string;
	createdAt?: Date;
	updatedAt?: Date;
	User?: Omit<IUser, "Client" | "Admin" | "ClientId" | "AdminId">;

}
