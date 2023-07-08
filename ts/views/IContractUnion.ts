import { ITypeLevel1 } from "./ITypeLevel1";
import { ITypeLevel2 } from "./ITypeLevel2";
import { ITypeLevel3 } from "./ITypeLevel3";
import { IContract } from "./IContract";
import { IContractAI } from "./IContractAI";
export type IContractUnion = {
	id?: number;
	type?: 'Contract' | 'ContractAI';
	clientId?: string;
	name?: string;
	level1Id?: number;
	level2Id?: number;
	level3Id?: number;
	level?: 3 | 2 | 1 | 0;
	createdAt?: Date;
	updatedAt?: Date;
	contractId?: number;
	contractAIId?: number;
	contract?: Omit<IContract, "ContractUnion_as_contract" | "ContractUnion_as_contractId">;
	contractAI?: Omit<IContractAI, "ContractUnion_as_contractAI" | "ContractUnion_as_contractAIId">;
	level1?: Omit<ITypeLevel1, "ContractUnion_as_level1" | "ContractUnion_as_level1Id">;
	level2?: Omit<ITypeLevel2, "ContractUnion_as_level2" | "ContractUnion_as_level2Id">;
	level3?: Omit<ITypeLevel3, "ContractUnion_as_level3" | "ContractUnion_as_level3Id">;

}
export const keysofIContractUnion: (keyof IContractUnion)[] = ["id", "type", "clientId", "name", "level1Id", "level2Id", "level3Id", "level", "createdAt", "updatedAt", "contractId", "contractAIId", "contract", "contractAI", "level1", "level2", "level3"]
