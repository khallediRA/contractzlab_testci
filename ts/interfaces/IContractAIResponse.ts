import { IContract } from "./IContract";
import { IContractAI } from "./IContractAI";
export interface IContractAIResponse {
	id?: number;
	externalId?: string;
	info?: object;
	content?: string;
	createdAt?: Date;
	updatedAt?: Date;
	contractAIId?: number;
	contractAI?: Omit<IContractAI, "ContractAIResponse_as_contractAI" | "ContractAIResponse_as_contractAIId">;

}
