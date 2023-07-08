import { IContractUnion } from "./IContractUnion";
import { ITypeLevel1 } from "./ITypeLevel1";
import { ITypeLevel3 } from "./ITypeLevel3";
import { IContract } from "./IContract";
import { IContractTemplate } from "./IContractTemplate";
import { IContractAI } from "./IContractAI";
import { IContractAIForm } from "./IContractAIForm";
export interface ITypeLevel2 {
	id?: number;
	name?: string;
	createdAt?: Date;
	updatedAt?: Date;
	level1Id?: number;
	level1?: Omit<ITypeLevel1, "levels2" | "levels2Id">;
	levels3?: (Omit<ITypeLevel3, "level2" | "level2Id">)[];
	levels3Id?: (number)[];
	ContractUnion_as_level2?: (Omit<IContractUnion, "level2" | "level2Id">)[];
	ContractUnion_as_level2Id?: (number)[];
	Contract_as_level2?: (Omit<IContract, "level2" | "level2Id">)[];
	Contract_as_level2Id?: (number)[];
	ContractTemplate_as_level2?: (Omit<IContractTemplate, "level2" | "level2Id">)[];
	ContractTemplate_as_level2Id?: (number)[];
	ContractAI_as_level2?: (Omit<IContractAI, "level2" | "level2Id">)[];
	ContractAI_as_level2Id?: (number)[];
	ContractAIForm_as_level2?: (Omit<IContractAIForm, "level2" | "level2Id">)[];
	ContractAIForm_as_level2Id?: (number)[];

}
