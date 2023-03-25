import { IClient } from "./IClient";
export type IBeneficial = {
	id?: number;
	name?: string;
	email?: string;
	firstName?: string;
	lastName?: string;
	dateOfBirth?: Date;
	placeOfBirth?: string;
	fullName?: string;
	createdAt?: Date;
	updatedAt?: Date;
	clientId?: string;
	display?: string;
	client?: Omit<IClient, "beneficials" | "beneficialsId">;

}
export const keysofIBeneficial: (keyof IBeneficial)[] = ["id", "name", "email", "firstName", "lastName", "dateOfBirth", "placeOfBirth", "fullName", "createdAt", "updatedAt", "clientId", "display", "client"]
