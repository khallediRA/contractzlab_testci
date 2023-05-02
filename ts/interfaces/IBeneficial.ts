import { IClient } from "./IClient";
export interface IBeneficial {
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
	client?: Omit<IClient, "beneficials" | "beneficialsId">;

}
