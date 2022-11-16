import { IUser } from "./IUser";
export interface IAdmin {
	id?: string;
	createdAt?: Date;
	updatedAt?: Date;
	User?: Omit<IUser, "Admin" | "AdminId">;

}
