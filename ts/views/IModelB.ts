import { IModelA } from "./IModelA";
import { IInterfaceA } from "./IInterfaceA";
export type IModelB = Omit<IInterfaceA, "ModelB" | "ModelA" | "ModelC" | "ModelBId" | "ModelAId" | "ModelCId"> & {
	id?: string;
	data?: object;
	createdAt?: Date;
	updatedAt?: Date;
	modelAId?: string;
	ModelA_as_modelsB?: Omit<IModelA, "modelsB" | "modelsBId">;

}
export const keysofIModelB: (keyof IModelB)[] = ["id", "data", "createdAt", "updatedAt", "modelAId", "ModelA_as_modelsB"]
