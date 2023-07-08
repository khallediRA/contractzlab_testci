import { IContractUnion } from "./IContractUnion";
import { ITypeLevel2 } from "./ITypeLevel2";
import { ITypeLevel3 } from "./ITypeLevel3";
import { IContract } from "./IContract";
import { IContractTemplate } from "./IContractTemplate";
import { IContractAI } from "./IContractAI";
import { IContractAIForm } from "./IContractAIForm";
export interface ITypeLevel1 {
	id?: number;
	name?: string;
	createdAt?: Date;
	updatedAt?: Date;
	levels2?: (Omit<ITypeLevel2, "level1" | "level1Id">)[];
	levels2Id?: (number)[];
	ContractUnion_as_level1?: (Omit<IContractUnion, "level1" | "level1Id">)[];
	ContractUnion_as_level1Id?: (number)[];
	TypeLevel3_as_level1?: (Omit<ITypeLevel3, "level1" | "level1Id">)[];
	TypeLevel3_as_level1Id?: (number)[];
	Contract_as_level1?: (Omit<IContract, "level1" | "level1Id">)[];
	Contract_as_level1Id?: (number)[];
	ContractTemplate_as_level1?: (Omit<IContractTemplate, "level1" | "level1Id">)[];
	ContractTemplate_as_level1Id?: (number)[];
	ContractAI_as_level1?: (Omit<IContractAI, "level1" | "level1Id">)[];
	ContractAI_as_level1Id?: (number)[];
	ContractAIForm_as_level1?: (Omit<IContractAIForm, "level1" | "level1Id">)[];
	ContractAIForm_as_level1Id?: (number)[];

}
