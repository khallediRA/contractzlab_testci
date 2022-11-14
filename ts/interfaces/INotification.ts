import { IUser } from "./IUser";
import { INotification_User } from "./INotification_User";
export interface INotification {
	id?: number;
	type?: 'Custom' | 'Create' | 'Update';
	message?: string;
	ressourceName?: '' | 'ModelA';
	ressourceId?: string;
	triggeredBy?: string;
	createdAt?: Date;
	updatedAt?: Date;
	users?: (Omit<IUser, "notifications" | "notificationsId"> & { Notification_User?: INotification_User })[];
	usersId?: (string)[];

}
export const keysofINotification: (keyof INotification)[] = ["id", "type", "message", "ressourceName", "ressourceId", "triggeredBy", "createdAt", "updatedAt", "users", "usersId"]
