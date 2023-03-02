import { IClient } from "./IClient";
import { IContractTemplate } from "./IContractTemplate";
export interface IContract {
	id?: number;
	name?: string;
	paramValues?: object;
	createdAt?: Date;
	updatedAt?: Date;
	templateId?: number;
	clientId?: string;
	template?: Omit<IContractTemplate, "Contract_as_template" | "Contract_as_templateId">;
	client?: Omit<IClient, "Contract_as_client" | "Contract_as_clientId">;

}
