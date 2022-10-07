import { IModelA } from "./IModelA";
import { IModelB } from "./IModelB";
import { IModelC } from "./IModelC";
export interface IInterfaceA {
	id?: string;
	geoPoint?: [number,number];
	data?: object;
	InterfaceAType?: 'ModelA' | 'ModelB' | 'ModelC';
	createdAt?: Date;
	updatedAt?: Date;
	ModelA?: Omit<IModelA, "InterfaceA" | "InterfaceAId">;
	ModelB?: Omit<IModelB, "InterfaceA" | "InterfaceAId">;
	ModelC?: Omit<IModelC, "InterfaceA" | "InterfaceAId">;

}
export const keysofIInterfaceA: (keyof IInterfaceA)[] = ["id", "geoPoint", "data", "InterfaceAType", "createdAt", "updatedAt", "ModelA", "ModelB", "ModelC"]
