export type IParentA = {
	id?: string;
	geoPoint?: [number,number];
	data?: object;
	ParentAType?: 'ModelA';
	createdAt?: Date;
	updatedAt?: Date;

}
export const keysofIParentA: (keyof IParentA)[] = ["id", "geoPoint", "data", "ParentAType", "createdAt", "updatedAt"]
