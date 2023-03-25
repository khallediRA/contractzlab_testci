import { IExternalToken } from "./IExternalToken";
import { INotification } from "./INotification";
import { INotification_User } from "./INotification_User";
import { IEvent } from "./IEvent";
import { IEvent_User } from "./IEvent_User";
export type IUser = {
	id?: string;
	activated?: boolean;
	passwordChangedDate?: Date;
	logoutDate?: Date;
	username?: string;
	email?: string;
	phoneNumber?: string;
	firstName?: string;
	lastName?: string;
	dateOfBirth?: Date;
	placeOfBirth?: string;
	profilePhoto?: { key: string, url: string };
	password?: string;
	fullName?: string;
	UserType?: 'Admin' | 'Client' | 'Moderator';
	createdAt?: Date;
	updatedAt?: Date;
	display?: string;
	notifications?: (Omit<INotification, "users" | "usersId"> & { Notification_User?: INotification_User })[];
	notificationsId?: (number)[];
	ExternalToken_as_user?: (Omit<IExternalToken, "user" | "userId">)[];
	ExternalToken_as_userId?: (string)[];
	Event_as_users?: (Omit<IEvent, "users" | "usersId"> & { Event_User?: IEvent_User })[];
	Event_as_usersId?: (number)[];

}
export const keysofIUser: (keyof IUser)[] = ["id", "activated", "passwordChangedDate", "logoutDate", "username", "email", "phoneNumber", "firstName", "lastName", "dateOfBirth", "placeOfBirth", "profilePhoto", "password", "fullName", "UserType", "createdAt", "updatedAt", "display", "notifications", "notificationsId", "ExternalToken_as_user", "ExternalToken_as_userId", "Event_as_users", "Event_as_usersId"]
