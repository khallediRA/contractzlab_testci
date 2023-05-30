import { IClient } from "./IClient";
import { IContract } from "./IContract";
import { IContractAIForm } from "./IContractAIForm";
import { IContractAIResponse } from "./IContractAIResponse";
export type IContractAI = {
	id?: number;
	status?: string;
	name?: string;
	file?: { key: string, url: string };
	textFile?: { key: string, url: string };
	openAIId?: string;
	summarySheet?: [string, string, string, string][];
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
export const keysofIContractAI: (keyof IContractAI)[] = ["id", "status", "name", "file", "textFile", "openAIId", "summarySheet", "clientId", "createdAt", "updatedAt", "formId", "display", "form", "responses", "responsesId", "client"]
