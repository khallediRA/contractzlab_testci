import { ITypeLevel2 } from "./ITypeLevel2";
export interface ITypeLevel1 {
	id?: number;
	name?: string;
	createdAt?: Date;
	updatedAt?: Date;
	levels2?: (Omit<ITypeLevel2, "level1" | "level1_id">)[];
	levels2Id?: (number)[];

}
