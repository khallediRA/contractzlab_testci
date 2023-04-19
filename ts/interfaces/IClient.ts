import { IUser } from "./IUser";
import { IContract } from "./IContract";
import { IBeneficial } from "./IBeneficial";
import { IDocument } from "./IDocument";
import { IContractAI } from "./IContractAI";
export interface IClient {
	id?: string;
	createdAt?: Date;
	updatedAt?: Date;
	User?: Omit<IUser, "Client" | "Admin" | "Moderator" | "ClientId" | "AdminId" | "ModeratorId">;
	contracts?: (Omit<IContract, "client" | "clientId">)[];
	contractsId?: (string)[];
	beneficials?: (Omit<IBeneficial, "client" | "clientId">)[];
	beneficialsId?: (string)[];
	documents?: (Omit<IDocument, "client" | "clientId">)[];
	documentsId?: (string)[];
	ContractAI_as_client?: (Omit<IContractAI, "client" | "clientId">)[];
	ContractAI_as_clientId?: (string)[];

}
