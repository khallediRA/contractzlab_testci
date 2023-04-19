import { ITypeLevel1 } from "./ITypeLevel1";
import { ITypeLevel2 } from "./ITypeLevel2";
import { ITypeLevel3 } from "./ITypeLevel3";
import { IContract } from "./IContract";
import { IContractAI } from "./IContractAI";
export interface IContractAIForm {
	id?: number;
	language?: 'en' | 'fr';
	code?: string;
	name?: string;
	questions?: string[];
	level1Id?: number;
	level2Id?: number;
	createdAt?: Date;
	updatedAt?: Date;
	level3Id?: number;
	level3?: Omit<ITypeLevel3, "ContractAIForm_as_level3" | "ContractAIForm_as_level3Id">;
	level2?: Omit<ITypeLevel2, "ContractAIForm_as_level2" | "ContractAIForm_as_level2Id">;
	level1?: Omit<ITypeLevel1, "ContractAIForm_as_level1" | "ContractAIForm_as_level1Id">;
	ContractAI_as_form?: (Omit<IContractAI, "form" | "formId">)[];
	ContractAI_as_formId?: (number)[];

}
