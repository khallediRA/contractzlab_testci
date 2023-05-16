import { IClient } from "./IClient";
import { IContract } from "./IContract";
import { IContractAIForm } from "./IContractAIForm";
import { IContractAIResponse } from "./IContractAIResponse";
export interface IContractAI {
	id?: number;
	status?: string;
	name?: string;
	content?: string;
	file?: { key: string, url: string };
	summarySheet?: [string, string][];
	clientId?: string;
	createdAt?: Date;
	updatedAt?: Date;
	formId?: number;
	form?: Omit<IContractAIForm, "ContractAI_as_form" | "ContractAI_as_formId">;
	responses?: (Omit<IContractAIResponse, "contractAI" | "contractAIId">)[];
	responsesId?: (number)[];
	client?: Omit<IClient, "ContractAI_as_client" | "ContractAI_as_clientId">;

}
