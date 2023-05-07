import { IClient } from "./IClient";
import { IContract } from "./IContract";
import { IContractAIForm } from "./IContractAIForm";
import { IContractAIResponse } from "./IContractAIResponse";
export type IContractAI = {
	id?: number;
	status?: string;
	name?: string;
	content?: string;
	file?: { key: string, url: string };
	clientId?: string;
	createdAt?: Date;
	updatedAt?: Date;
	formId?: number;
	display?: string;
	form?: Omit<IContractAIForm, "ContractAI_as_form" | "ContractAI_as_formId">;
	responses?: (Omit<IContractAIResponse, "contractAI" | "contractAIId">)[];
	responsesId?: (number)[];
	client?: Omit<IClient, "ContractAI_as_client" | "ContractAI_as_clientId">;

}
export const keysofIContractAI: (keyof IContractAI)[] = ["id", "status", "name", "content", "file", "clientId", "createdAt", "updatedAt", "formId", "display", "form", "responses", "responsesId", "client"]
