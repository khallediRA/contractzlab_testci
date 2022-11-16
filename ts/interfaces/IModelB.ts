import { IModelA } from "./IModelA";
import { IInterfaceA } from "./IInterfaceA";
export interface IModelB {
	id?: string;
	data?: object;
	createdAt?: Date;
	updatedAt?: Date;
	modelAId?: string;
	InterfaceA?: Omit<IInterfaceA, "ModelB" | "ModelA" | "ModelC" | "ModelBId" | "ModelAId" | "ModelCId">;
	InterfaceAId?: string;
	ModelA_as_modelsB?: Omit<IModelA, "modelsB" | "modelsBId">;

}
