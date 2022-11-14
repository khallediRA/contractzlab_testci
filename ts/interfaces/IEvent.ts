import { IUser } from "./IUser";
import { IEvent_User } from "./IEvent_User";
export interface IEvent {
	id?: number;
	title?: string;
	flag?: 'Custom';
	startDate?: Date;
	endDate?: Date;
	allDay?: boolean;
	description?: string;
	createdAt?: Date;
	updatedAt?: Date;
	users?: (Omit<IUser, "Event_as_users" | "Event_as_usersId"> & { Event_User?: IEvent_User })[];
	usersId?: (string)[];

}
export const keysofIEvent: (keyof IEvent)[] = ["id", "title", "flag", "startDate", "endDate", "allDay", "description", "createdAt", "updatedAt", "users", "usersId"]
