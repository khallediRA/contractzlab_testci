import { IContract } from "./IContract";
import { IContractTemplate } from "./IContractTemplate";
import { IContractTemplate_Clause } from "./IContractTemplate_Clause";
export interface IClause {
	id?: number;
	name?: string;
	createdAt?: Date;
	updatedAt?: Date;
	ContractTemplate_as_clauses?: (Omit<IContractTemplate, "clauses" | "clausesId"> & { ContractTemplate_Clause?: IContractTemplate_Clause })[];
	ContractTemplate_as_clausesId?: (number)[];

}
