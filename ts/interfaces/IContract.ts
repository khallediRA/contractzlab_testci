import { IContractUnion } from "./IContractUnion";
import { IClient } from "./IClient";
import { ITypeLevel1 } from "./ITypeLevel1";
import { ITypeLevel2 } from "./ITypeLevel2";
import { ITypeLevel3 } from "./ITypeLevel3";
import { IContractTemplate } from "./IContractTemplate";
export interface IContract {
	id?: number;
	status?: string;
	name?: string;
	paramValues?: object;
	excludedClauses?: number[];
	excludedSubClauses?: number[];
	annexes?: { key: string, fileName:string, url: string }[];
	fileNames?: any;
	level1Id?: number;
	level2Id?: number;
	level3Id?: number;
	clientId?: string;
	level?: 3 | 2 | 1 | 0;
	createdAt?: Date;
	updatedAt?: Date;
	templateId?: number;
	level1?: Omit<ITypeLevel1, "Contract_as_level1" | "Contract_as_level1Id">;
	level2?: Omit<ITypeLevel2, "Contract_as_level2" | "Contract_as_level2Id">;
	level3?: Omit<ITypeLevel3, "Contract_as_level3" | "Contract_as_level3Id">;
	template?: Omit<IContractTemplate, "Contract_as_template" | "Contract_as_templateId">;
	client?: Omit<IClient, "contracts" | "contractsId">;
	ContractUnion_as_contract?: (Omit<IContractUnion, "contract" | "contractId">)[];
	ContractUnion_as_contractId?: (number)[];

}
