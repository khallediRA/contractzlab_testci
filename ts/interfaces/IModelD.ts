export interface IModelD {
	id?: string;
	name?: string;
	text?: string;
	file?: { key: string, url: string };
	createdAt?: Date;
	updatedAt?: Date;

}
export const keysofIModelD: (keyof IModelD)[] = ["id", "name", "text", "file", "createdAt", "updatedAt"]
