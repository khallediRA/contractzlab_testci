import { IModelB } from "./IModelB";
import { IInterfaceA } from "./IInterfaceA";
import { IParentA } from "./IParentA";
export type IModelA = Omit<IInterfaceA, "ModelA" | "ModelB" | "ModelC" | "ModelAId" | "ModelBId" | "ModelCId"> & Omit<IParentA, "ModelA" | "ModelAId"> & {
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
	ParentAType?: 'ModelA';
	InterfaceAType?: 'ModelA';
	modelsB?: (Omit<IModelB, "ModelA_as_modelsB" | "ModelA_as_modelsBId">)[];
	modelsBId?: (string)[];

}
export const keysofIModelA: (keyof IModelA)[] = ["id", "days", "geoPoint", "geoPolygon", "hashedPass", "profilePhoto", "documents", "s3File", "data", "createdAt", "updatedAt", "ParentAType", "InterfaceAType", "modelsB", "modelsBId"]
