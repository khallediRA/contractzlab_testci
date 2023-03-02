import { IUser } from "./IUser";
import { INotification_User } from "./INotification_User";
export interface INotification {
	id?: number;
	type?: 'Custom' | 'Create' | 'Update';
	message?: string;
	ressourceName?: '';
	ressourceId?: string;
	triggeredBy?: string;
	createdAt?: Date;
	updatedAt?: Date;
	users?: (Omit<IUser, "notifications" | "notificationsId"> & { Notification_User?: INotification_User })[];
	usersId?: (string)[];

}
