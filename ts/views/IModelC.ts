import { IInterfaceA } from "./IInterfaceA";
export type IModelC = Omit<IInterfaceA, "ModelC" | "ModelA" | "ModelB" | "ModelCId" | "ModelAId" | "ModelBId"> & {
	id?: string;
	data?: object;
	createdAt?: Date;
	updatedAt?: Date;

}
export const keysofIModelC: (keyof IModelC)[] = ["id", "data", "createdAt", "updatedAt"]
