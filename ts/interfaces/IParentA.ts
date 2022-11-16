import { IModelA } from "./IModelA";
export interface IParentA {
	id?: string;
	geoPoint?: [number,number];
	data?: object;
	ParentAType?: 'ModelA';
	createdAt?: Date;
	updatedAt?: Date;
	ModelA?: Omit<IModelA, "ParentA">;
	ModelAId?: string;

}
