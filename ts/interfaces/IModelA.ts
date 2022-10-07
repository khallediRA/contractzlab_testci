import { IModelB } from "./IModelB";
import { IInterfaceA } from "./IInterfaceA";
import { IParentA } from "./IParentA";
export interface IModelA {
	id?: string;
	days?: ('Fri' | 'Mon' | 'Satur' | 'Sun' | 'Thurs' | 'Tues' | 'Wendes')[];
	geoPoint?: [number,number];
	geoPolygon?: [number,number][];
	hashedPass?: string;
	profilePhoto?: { key: string, url: string };
	documents?: { key: string, url: string }[];
	s3File?: { key: string, url: string };
	data?: object;
	createdAt?: Date;
	updatedAt?: Date;
	modelsB?: (Omit<IModelB, "ModelA_as_modelsB" | "ModelA_as_modelsBId">)[];
	modelsBId?: (string)[];
	InterfaceA?: Omit<IInterfaceA, "ModelA" | "ModelB" | "ModelC" | "ModelAId" | "ModelBId" | "ModelCId">;
	InterfaceAId?: string;
	ParentA?: Omit<IParentA, "ModelA" | "ModelAId">;

}
export const keysofIModelA: (keyof IModelA)[] = ["id", "days", "geoPoint", "geoPolygon", "hashedPass", "profilePhoto", "documents", "s3File", "data", "createdAt", "updatedAt", "modelsB", "modelsBId", "InterfaceA", "InterfaceAId", "ParentA"]
