import { IClient } from "./IClient";
export type IDocument = {
	id?: number;
	name?: string;
	file?: { key: string, url: string };
	createdAt?: Date;
	updatedAt?: Date;
	clientId?: string;
	display?: string;
	client?: Omit<IClient, "documents" | "documentsId">;

}
export const keysofIDocument: (keyof IDocument)[] = ["id", "name", "file", "createdAt", "updatedAt", "clientId", "display", "client"]
