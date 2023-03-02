import { IUser } from "./IUser";
import { IContract } from "./IContract";
export interface IClient {
	id?: string;
	createdAt?: Date;
	updatedAt?: Date;
	User?: Omit<IUser, "Client" | "Admin" | "Moderator" | "ClientId" | "AdminId" | "ModeratorId">;
	Contract_as_client?: (Omit<IContract, "client" | "clientId">)[];
	Contract_as_clientId?: (string)[];

}
