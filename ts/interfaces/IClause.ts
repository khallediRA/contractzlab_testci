import { ISubClause } from "./ISubClause";
import { IContract } from "./IContract";
import { IContractTemplate } from "./IContractTemplate";
import { IContractTemplate_Clause } from "./IContractTemplate_Clause";
export interface IClause {
	id?: number;
	code?: string;
	name?: string;
	params?: {    name: string,    label: string,    args?: any,    type: 'string' | 'boolean' | 'list' | 'date' | 'number' | 'beneficial' | 'file'  }[];
	rawText?: string[];
	createdAt?: Date;
	updatedAt?: Date;
	subClauses?: (Omit<ISubClause, "Clause_as_subClauses" | "Clause_as_subClausesId">)[];
	subClausesId?: (number)[];
	ContractTemplate_as_clauses?: (Omit<IContractTemplate, "clauses" | "clausesId"> & { ContractTemplate_Clause?: IContractTemplate_Clause })[];
	ContractTemplate_as_clausesId?: (number)[];

}
