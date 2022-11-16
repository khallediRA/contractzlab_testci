import { IUser } from "./IUser";
export type IAdmin = Omit<IUser, "Admin" | "AdminId"> & {
	id?: string;
	createdAt?: Date;
	updatedAt?: Date;

}
export const keysofIAdmin: (keyof IAdmin)[] = ["id", "createdAt", "updatedAt"]
