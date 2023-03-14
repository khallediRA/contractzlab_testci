import { IClause } from "./IClause";
export interface ISubClause {
	id?: number;
	index?: string;
	code?: string;
	name?: string;
	isOptional?: boolean;
	params?: {    name: string,    label: string,    type: 'string' | 'boolean' | 'date' | 'number' | 'beneficial' | 'file'  }[];
	rawText?: string[];
	createdAt?: Date;
	updatedAt?: Date;
	clauseId?: number;
	Clause_as_subClauses?: Omit<IClause, "subClauses" | "subClausesId">;

}
