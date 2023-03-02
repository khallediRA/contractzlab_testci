import { IClient } from "./IClient";
export interface IBeneficial {
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
	client?: Omit<IClient, "beneficials" | "beneficialsId">;

}
