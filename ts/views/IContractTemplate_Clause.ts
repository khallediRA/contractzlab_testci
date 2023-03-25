import { IContract } from "./IContract";
import { IContractTemplate } from "./IContractTemplate";
export type IContractTemplate_Clause = {
	id?: number;
	index?: string;
	isOptional?: boolean;
	createdAt?: Date;
	updatedAt?: Date;
	ContractTemplateId?: number;
	ClauseId?: number;

}
export const keysofIContractTemplate_Clause: (keyof IContractTemplate_Clause)[] = ["id", "index", "isOptional", "createdAt", "updatedAt", "ContractTemplateId", "ClauseId"]
