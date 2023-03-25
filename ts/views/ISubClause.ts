import { IClause } from "./IClause";
export type ISubClause = {
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
	display?: string;
	Clause_as_subClauses?: Omit<IClause, "subClauses" | "subClausesId">;

}
export const keysofISubClause: (keyof ISubClause)[] = ["id", "index", "code", "name", "isOptional", "params", "rawText", "createdAt", "updatedAt", "clauseId", "display", "Clause_as_subClauses"]
