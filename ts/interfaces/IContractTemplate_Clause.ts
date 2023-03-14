import { IContract } from "./IContract";
import { IContractTemplate } from "./IContractTemplate";
export interface IContractTemplate_Clause {
	id?: number;
	index?: string;
	isOptional?: boolean;
	createdAt?: Date;
	updatedAt?: Date;
	ContractTemplateId?: number;
	ClauseId?: number;

}
