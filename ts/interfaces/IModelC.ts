import { IInterfaceA } from "./IInterfaceA";
export interface IModelC {
	id?: string;
	data?: object;
	createdAt?: Date;
	updatedAt?: Date;
	InterfaceA?: Omit<IInterfaceA, "ModelC" | "ModelA" | "ModelB" | "ModelCId" | "ModelAId" | "ModelBId">;
	InterfaceAId?: string;

}
