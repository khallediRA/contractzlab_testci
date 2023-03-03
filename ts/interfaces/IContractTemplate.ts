import { ITypeLevel1 } from "./ITypeLevel1";
import { ITypeLevel2 } from "./ITypeLevel2";
import { ITypeLevel3 } from "./ITypeLevel3";
import { IClause } from "./IClause";
import { IContract } from "./IContract";
import { IContractTemplate_Clause } from "./IContractTemplate_Clause";
export interface IContractTemplate {
	id?: number;
	name?: string;
	level1Id?: number;
	level2Id?: number;
	createdAt?: Date;
	updatedAt?: Date;
	typeLevel3Id?: number;
	clauses?: (Omit<IClause, "ContractTemplate_as_clauses" | "ContractTemplate_as_clausesId"> & { ContractTemplate_Clause?: IContractTemplate_Clause })[];
	clausesId?: (number)[];
	typeLevel3?: Omit<ITypeLevel3, "ContractTemplate_as_typeLevel3" | "ContractTemplate_as_typeLevel3Id">;
	level2?: Omit<ITypeLevel2, "ContractTemplate_as_level2" | "ContractTemplate_as_level2Id">;
	level1?: Omit<ITypeLevel1, "ContractTemplate_as_level1" | "ContractTemplate_as_level1Id">;
	Contract_as_template?: (Omit<IContract, "template" | "templateId">)[];
	Contract_as_templateId?: (number)[];

}
