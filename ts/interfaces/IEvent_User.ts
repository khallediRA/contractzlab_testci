import { IEvent } from "./IEvent";
export interface IEvent_User {
	id?: number;
	createdAt?: Date;
	updatedAt?: Date;
	EventId?: number;
	UserId?: string;

}
export const keysofIEvent_User: (keyof IEvent_User)[] = ["id", "createdAt", "updatedAt", "EventId", "UserId"]
