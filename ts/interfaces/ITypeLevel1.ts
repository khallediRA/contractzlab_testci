import { ITypeLevel2 } from "./ITypeLevel2";
import { ITypeLevel3 } from "./ITypeLevel3";
import { IContract } from "./IContract";
import { IContractTemplate } from "./IContractTemplate";
export interface ITypeLevel1 {
	id?: number;
	name?: string;
	createdAt?: Date;
	updatedAt?: Date;
	levels2?: (Omit<ITypeLevel2, "level1" | "level1Id">)[];
	levels2Id?: (number)[];
	TypeLevel3_as_level1?: (Omit<ITypeLevel3, "level1" | "level1Id">)[];
	TypeLevel3_as_level1Id?: (number)[];
	ContractTemplate_as_level1?: (Omit<IContractTemplate, "level1" | "level1Id">)[];
	ContractTemplate_as_level1Id?: (number)[];

}
