import { IUser } from "./IUser";
export interface IAdmin {
	id?: number;
	createdAt?: Date;
	updatedAt?: Date;
	User?: Omit<IUser, "Admin" | "AdminId">;

}
export const keysofIAdmin: (keyof IAdmin)[] = ["id", "createdAt", "updatedAt", "User"]
