import { IUser } from "./IUser";
export type IClient = Omit<IUser, "Client" | "Admin" | "ClientId" | "AdminId"> & {
	id?: string;
	createdAt?: Date;
	updatedAt?: Date;

}
export const keysofIClient: (keyof IClient)[] = ["id", "createdAt", "updatedAt"]
