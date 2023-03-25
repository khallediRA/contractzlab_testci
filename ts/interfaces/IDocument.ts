import { IClient } from "./IClient";
export interface IDocument {
	id?: number;
	name?: string;
	file?: { key: string, url: string };
	createdAt?: Date;
	updatedAt?: Date;
	clientId?: string;
	client?: Omit<IClient, "documents" | "documentsId">;

}
