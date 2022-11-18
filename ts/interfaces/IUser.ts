import { IAdmin } from "./IAdmin";
import { IClient } from "./IClient";
import { INotification } from "./INotification";
import { INotification_User } from "./INotification_User";
import { IEvent } from "./IEvent";
import { IEvent_User } from "./IEvent_User";
export interface IUser {
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
	password?: string;
	fullName?: string;
	UserType?: 'Admin' | 'Client';
	createdAt?: Date;
	updatedAt?: Date;
	Admin?: Omit<IAdmin, "User">;
	AdminId?: string;
	Client?: Omit<IClient, "User">;
	ClientId?: string;
	notifications?: (Omit<INotification, "users" | "usersId"> & { Notification_User?: INotification_User })[];
	notificationsId?: (number)[];
	Event_as_users?: (Omit<IEvent, "users" | "usersId"> & { Event_User?: IEvent_User })[];
	Event_as_usersId?: (number)[];

}
