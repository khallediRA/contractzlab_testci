import { IContractUnion } from "./IContractUnion";
import { ITypeLevel1 } from "./ITypeLevel1";
import { ITypeLevel2 } from "./ITypeLevel2";
import { IContract } from "./IContract";
import { IContractTemplate } from "./IContractTemplate";
import { IContractAI } from "./IContractAI";
import { IContractAIForm } from "./IContractAIForm";
export type ITypeLevel3 = {
	id?: number;
	name?: string;
	level1Id?: number;
	createdAt?: Date;
	updatedAt?: Date;
	level2Id?: number;
	display?: string;
	level1?: Omit<ITypeLevel1, "TypeLevel3_as_level1" | "TypeLevel3_as_level1Id">;
	level2?: Omit<ITypeLevel2, "levels3" | "levels3Id">;
	ContractUnion_as_level3?: (Omit<IContractUnion, "level3" | "level3Id">)[];
	ContractUnion_as_level3Id?: (number)[];
	Contract_as_level3?: (Omit<IContract, "level3" | "level3Id">)[];
	Contract_as_level3Id?: (number)[];
	ContractTemplate_as_level3?: (Omit<IContractTemplate, "level3" | "level3Id">)[];
	ContractTemplate_as_level3Id?: (number)[];
	ContractAI_as_level3?: (Omit<IContractAI, "level3" | "level3Id">)[];
	ContractAI_as_level3Id?: (number)[];
	ContractAIForm_as_level3?: (Omit<IContractAIForm, "level3" | "level3Id">)[];
	ContractAIForm_as_level3Id?: (number)[];

}
export const keysofITypeLevel3: (keyof ITypeLevel3)[] = ["id", "name", "level1Id", "createdAt", "updatedAt", "level2Id", "display", "level1", "level2", "ContractUnion_as_level3", "ContractUnion_as_level3Id", "Contract_as_level3", "Contract_as_level3Id", "ContractTemplate_as_level3", "ContractTemplate_as_level3Id", "ContractAI_as_level3", "ContractAI_as_level3Id", "ContractAIForm_as_level3", "ContractAIForm_as_level3Id"]
