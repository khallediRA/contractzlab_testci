import { ISubClause } from "./ISubClause";
import { IContract } from "./IContract";
import { IContractTemplate } from "./IContractTemplate";
import { IContractTemplate_Clause } from "./IContractTemplate_Clause";
export type IClause = {
	id?: number;
	code?: string;
	name?: string;
	params?: {    name: string,    label: string,    type: 'string' | 'boolean' | 'date' | 'number' | 'beneficial' | 'file'  }[];
	rawText?: string[];
	createdAt?: Date;
	updatedAt?: Date;
	display?: string;
	subClauses?: (Omit<ISubClause, "Clause_as_subClauses" | "Clause_as_subClausesId">)[];
	subClausesId?: (number)[];
	ContractTemplate_as_clauses?: (Omit<IContractTemplate, "clauses" | "clausesId"> & { ContractTemplate_Clause?: IContractTemplate_Clause })[];
	ContractTemplate_as_clausesId?: (number)[];

}
export const keysofIClause: (keyof IClause)[] = ["id", "code", "name", "params", "rawText", "createdAt", "updatedAt", "display", "subClauses", "subClausesId", "ContractTemplate_as_clauses", "ContractTemplate_as_clausesId"]
