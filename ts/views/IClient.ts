import { IUser } from "./IUser";
import { IContract } from "./IContract";
import { IBeneficial } from "./IBeneficial";
import { IDocument } from "./IDocument";
import { IContractAI } from "./IContractAI";
export type IClient = Omit<IUser, "Client" | "Admin" | "Moderator" | "ClientId" | "AdminId" | "ModeratorId"> & {
	id?: string;
	createdAt?: Date;
	updatedAt?: Date;
	display?: string;
	UserType?: 'Client';
	contracts?: (Omit<IContract, "client" | "clientId">)[];
	contractsId?: (string)[];
	beneficials?: (Omit<IBeneficial, "client" | "clientId">)[];
	beneficialsId?: (string)[];
	documents?: (Omit<IDocument, "client" | "clientId">)[];
	documentsId?: (string)[];
	ContractAI_as_client?: (Omit<IContractAI, "client" | "clientId">)[];
	ContractAI_as_clientId?: (string)[];

}
export const keysofIClient: (keyof IClient)[] = ["id", "createdAt", "updatedAt", "display", "UserType", "contracts", "contractsId", "beneficials", "beneficialsId", "documents", "documentsId", "ContractAI_as_client", "ContractAI_as_clientId"]
