import { IClient } from "./IClient";
import { IContractTemplate } from "./IContractTemplate";
export type IContract = {
	id?: number;
	status?: string;
	name?: string;
	paramValues?: object;
	excludedClauses?: number[];
	excludedSubClauses?: number[];
	annexes?: { key: string, fileName:string, url: string }[];
	fileNames?: any;
	clientId?: string;
	createdAt?: Date;
	updatedAt?: Date;
	templateId?: number;
	display?: string;
	template?: Omit<IContractTemplate, "Contract_as_template" | "Contract_as_templateId">;
	client?: Omit<IClient, "contracts" | "contractsId">;

}
export const keysofIContract: (keyof IContract)[] = ["id", "status", "name", "paramValues", "excludedClauses", "excludedSubClauses", "annexes", "fileNames", "clientId", "createdAt", "updatedAt", "templateId", "display", "template", "client"]
