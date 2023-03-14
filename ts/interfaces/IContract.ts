import { IClient } from "./IClient";
import { IContractTemplate } from "./IContractTemplate";
export interface IContract {
	id?: number;
	name?: string;
	paramValues?: object;
	excludedClauses?: number[];
	excludedSubClauses?: number[];
	annexes?: { key: string, fileName:string, url: string }[];
	createdAt?: Date;
	updatedAt?: Date;
	clientId?: string;
	templateId?: number;
	template?: Omit<IContractTemplate, "Contract_as_template" | "Contract_as_templateId">;
	client?: Omit<IClient, "contracts" | "contractsId">;

}
