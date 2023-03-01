import { ITypeLevel2 } from "./ITypeLevel2";
import { IContract } from "./IContract";
import { IContractTemplate } from "./IContractTemplate";
export interface ITypeLevel3 {
	id?: number;
	name?: string;
	createdAt?: Date;
	updatedAt?: Date;
	level2_id?: number;
	level2?: Omit<ITypeLevel2, "levels3" | "levels3Id">;
	ContractTemplate_as_typeLevel3?: (Omit<IContractTemplate, "typeLevel3" | "typeLevel3_id">)[];
	ContractTemplate_as_typeLevel3Id?: (number)[];

}
