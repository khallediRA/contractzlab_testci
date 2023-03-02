import { IClause_SubClause } from "./IClause_SubClause";
import { ISubClause } from "./ISubClause";
import { IContract } from "./IContract";
import { IContractTemplate } from "./IContractTemplate";
import { IContractTemplate_Clause } from "./IContractTemplate_Clause";
export interface IClause {
	id?: number;
	name?: string;
	isOptional?: boolean;
	createdAt?: Date;
	updatedAt?: Date;
	subClauses?: (Omit<ISubClause, "Clause_as_subClauses" | "Clause_as_subClausesId"> & { Clause_SubClause?: IClause_SubClause })[];
	subClausesId?: (number)[];
	ContractTemplate_as_clauses?: (Omit<IContractTemplate, "clauses" | "clausesId"> & { ContractTemplate_Clause?: IContractTemplate_Clause })[];
	ContractTemplate_as_clausesId?: (number)[];

}
