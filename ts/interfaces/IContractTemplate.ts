import { ITypeLevel3 } from "./ITypeLevel3";
import { IClause } from "./IClause";
import { IContract } from "./IContract";
import { IContractTemplate_Clause } from "./IContractTemplate_Clause";
export interface IContractTemplate {
	id?: number;
	name?: string;
	createdAt?: Date;
	updatedAt?: Date;
	typeLevel3_id?: number;
	clauses?: (Omit<IClause, "ContractTemplate_as_clauses" | "ContractTemplate_as_clausesId"> & { ContractTemplate_Clause?: IContractTemplate_Clause })[];
	clausesId?: (number)[];
	typeLevel3?: Omit<ITypeLevel3, "ContractTemplate_as_typeLevel3" | "ContractTemplate_as_typeLevel3Id">;
	Contract_as_template?: (Omit<IContract, "template" | "template_id">)[];
	Contract_as_templateId?: (number)[];

}
