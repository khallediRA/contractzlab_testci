import { ITypeLevel1 } from "./ITypeLevel1";
import { ITypeLevel3 } from "./ITypeLevel3";
export interface ITypeLevel2 {
	id?: number;
	name?: string;
	createdAt?: Date;
	updatedAt?: Date;
	level1_id?: number;
	level1?: Omit<ITypeLevel1, "levels2" | "levels2Id">;
	levels3?: (Omit<ITypeLevel3, "level2" | "level2_id">)[];
	levels3Id?: (number)[];

}
