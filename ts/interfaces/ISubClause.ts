import { IClause } from "./IClause";
import { IClause_SubClause } from "./IClause_SubClause";
export interface ISubClause {
	id?: number;
	name?: string;
	isOptional?: boolean;
	params?: object;
	rawText?: string;
	createdAt?: Date;
	updatedAt?: Date;
	Clause_as_subClauses?: (Omit<IClause, "subClauses" | "subClausesId"> & { Clause_SubClause?: IClause_SubClause })[];
	Clause_as_subClausesId?: (number)[];

}
