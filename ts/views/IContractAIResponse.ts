import { IContract } from "./IContract";
import { IContractAI } from "./IContractAI";
export type IContractAIResponse = {
	id?: number;
	externalId?: string;
	info?: object;
	content?: string;
	createdAt?: Date;
	updatedAt?: Date;
	contractAIId?: number;
	contractAI?: Omit<IContractAI, "responses" | "responsesId">;

}
export const keysofIContractAIResponse: (keyof IContractAIResponse)[] = ["id", "externalId", "info", "content", "createdAt", "updatedAt", "contractAIId", "contractAI"]
