import { ITypeLevel1 } from "./ITypeLevel1";
import { ITypeLevel3 } from "./ITypeLevel3";
import { IContract } from "./IContract";
import { IContractTemplate } from "./IContractTemplate";
export type ITypeLevel2 = {
	id?: number;
	name?: string;
	createdAt?: Date;
	updatedAt?: Date;
	level1Id?: number;
	display?: string;
	level1?: Omit<ITypeLevel1, "levels2" | "levels2Id">;
	levels3?: (Omit<ITypeLevel3, "level2" | "level2Id">)[];
	levels3Id?: (number)[];
	ContractTemplate_as_level2?: (Omit<IContractTemplate, "level2" | "level2Id">)[];
	ContractTemplate_as_level2Id?: (number)[];

}
export const keysofITypeLevel2: (keyof ITypeLevel2)[] = ["id", "name", "createdAt", "updatedAt", "level1Id", "display", "level1", "levels3", "levels3Id", "ContractTemplate_as_level2", "ContractTemplate_as_level2Id"]
