import { IUser } from "../interfaces";

export function isOfType(user: IUser | null | undefined, ...types: IUser["UserType"][]) {
  return types.includes(user?.UserType)
}
