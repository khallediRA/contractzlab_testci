import { ITypeLevel1 } from "./ITypeLevel1";
import { ITypeLevel2 } from "./ITypeLevel2";
import { IContract } from "./IContract";
import { IContractTemplate } from "./IContractTemplate";
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
	ContractTemplate_as_level3?: (Omit<IContractTemplate, "level3" | "level3Id">)[];
	ContractTemplate_as_level3Id?: (number)[];

}
export const keysofITypeLevel3: (keyof ITypeLevel3)[] = ["id", "name", "level1Id", "createdAt", "updatedAt", "level2Id", "display", "level1", "level2", "ContractTemplate_as_level3", "ContractTemplate_as_level3Id"]
