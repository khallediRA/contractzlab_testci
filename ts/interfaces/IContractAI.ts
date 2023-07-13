import { IContractUnion } from "./IContractUnion";
import { IClient } from "./IClient";
import { ITypeLevel1 } from "./ITypeLevel1";
import { ITypeLevel2 } from "./ITypeLevel2";
import { ITypeLevel3 } from "./ITypeLevel3";
import { IContract } from "./IContract";
import { IContractAIForm } from "./IContractAIForm";
import { IContractAIResponse } from "./IContractAIResponse";
export interface IContractAI {
	id?: number;
	status?: string;
	name?: string;
	file?: { key: string, url: string };
	textFile?: { key: string, url: string };
	openAIId?: string;
	summarySheet?: [string, string, string, string][];
	aiResponsesStatus?: [string, 0 | 1 | 2][];
	level1Id?: number;
	level2Id?: number;
	level3Id?: number;
	clientId?: string;
	level?: 3 | 2 | 1 | 0;
	createdAt?: Date;
	updatedAt?: Date;
	formId?: number;
	level1?: Omit<ITypeLevel1, "ContractAI_as_level1" | "ContractAI_as_level1Id">;
	level2?: Omit<ITypeLevel2, "ContractAI_as_level2" | "ContractAI_as_level2Id">;
	level3?: Omit<ITypeLevel3, "ContractAI_as_level3" | "ContractAI_as_level3Id">;
	form?: Omit<IContractAIForm, "ContractAI_as_form" | "ContractAI_as_formId">;
	client?: Omit<IClient, "ContractAI_as_client" | "ContractAI_as_clientId">;
	ContractUnion_as_contractAI?: (Omit<IContractUnion, "contractAI" | "contractAIId">)[];
	ContractUnion_as_contractAIId?: (number)[];
	ContractAIResponse_as_contractAI?: (Omit<IContractAIResponse, "contractAI" | "contractAIId">)[];
	ContractAIResponse_as_contractAIId?: (number)[];

}
