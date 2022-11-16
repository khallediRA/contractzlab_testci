export type IInterfaceA = {
	id?: string;
	geoPoint?: [number,number];
	data?: object;
	InterfaceAType?: 'ModelA' | 'ModelB' | 'ModelC';
	createdAt?: Date;
	updatedAt?: Date;

}
export const keysofIInterfaceA: (keyof IInterfaceA)[] = ["id", "geoPoint", "data", "InterfaceAType", "createdAt", "updatedAt"]
