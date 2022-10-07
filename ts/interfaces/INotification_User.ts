import { INotification } from "./INotification";
export interface INotification_User {
	id?: number;
	seenDate?: Date;
	createdAt?: Date;
	updatedAt?: Date;
	UserId?: number;
	NotificationId?: number;

}
export const keysofINotification_User: (keyof INotification_User)[] = ["id", "seenDate", "createdAt", "updatedAt", "UserId", "NotificationId"]
