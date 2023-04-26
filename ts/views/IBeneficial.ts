import { IClient } from "./IClient";
export type IBeneficial = {
	id?: number;
	name?: string;
	email?: string;
	jobTitle?: string;
	passport?: string;
	cin?: string;
	firstName?: string;
	lastName?: string;
	dateOfBirth?: Date;
	placeOfBirth?: string;
	address?:       {        "addressLine": string,        "postalCode": string,        "city": string,        "country": string,      }      ;
	fullName?: string;
	createdAt?: Date;
	updatedAt?: Date;
	clientId?: string;
	display?: string;
	client?: Omit<IClient, "beneficials" | "beneficialsId">;

}
export const keysofIBeneficial: (keyof IBeneficial)[] = ["id", "name", "email", "jobTitle", "passport", "cin", "firstName", "lastName", "dateOfBirth", "placeOfBirth", "address", "fullName", "createdAt", "updatedAt", "clientId", "display", "client"]
