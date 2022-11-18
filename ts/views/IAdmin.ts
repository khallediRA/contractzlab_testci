import { IUser } from "./IUser";
export type IAdmin = Omit<IUser, "Admin" | "Client" | "AdminId" | "ClientId"> & {
	id?: string;
	createdAt?: Date;
	updatedAt?: Date;

}
export const keysofIAdmin: (keyof IAdmin)[] = ["id", "createdAt", "updatedAt"]
