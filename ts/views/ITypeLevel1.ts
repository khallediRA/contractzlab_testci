import { ITypeLevel2 } from "./ITypeLevel2";
import { ITypeLevel3 } from "./ITypeLevel3";
import { IContract } from "./IContract";
import { IContractTemplate } from "./IContractTemplate";
import { IContractAI } from "./IContractAI";
import { IContractAIForm } from "./IContractAIForm";
export type ITypeLevel1 = {
	id?: number;
	name?: string;
	createdAt?: Date;
	updatedAt?: Date;
	display?: string;
	levels2?: (Omit<ITypeLevel2, "level1" | "level1Id">)[];
	levels2Id?: (number)[];
	TypeLevel3_as_level1?: (Omit<ITypeLevel3, "level1" | "level1Id">)[];
	TypeLevel3_as_level1Id?: (number)[];
	ContractTemplate_as_level1?: (Omit<IContractTemplate, "level1" | "level1Id">)[];
	ContractTemplate_as_level1Id?: (number)[];
	ContractAIForm_as_level1?: (Omit<IContractAIForm, "level1" | "level1Id">)[];
	ContractAIForm_as_level1Id?: (number)[];

}
export const keysofITypeLevel1: (keyof ITypeLevel1)[] = ["id", "name", "createdAt", "updatedAt", "display", "levels2", "levels2Id", "TypeLevel3_as_level1", "TypeLevel3_as_level1Id", "ContractTemplate_as_level1", "ContractTemplate_as_level1Id", "ContractAIForm_as_level1", "ContractAIForm_as_level1Id"]
