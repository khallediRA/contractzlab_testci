import { IUser } from "./IUser";
import { IContract } from "./IContract";
export interface IClient {
	id?: string;
	createdAt?: Date;
	updatedAt?: Date;
	User?: Omit<IUser, "Client" | "Admin" | "Moderator" | "ClientId" | "AdminId" | "ModeratorId">;
	contracts?: (Omit<IContract, "client" | "clientId">)[];
	contractsId?: (string)[];

}
