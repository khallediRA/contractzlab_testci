import { KishiModel, KishiModelAttributes, KishiDataTypes, KOp, typesOfKishiAssociationOptions, CrudOptions } from "../../sequelize";
import { User } from "../User";
export class Admin extends KishiModel {
  static crudOptions: CrudOptions = {
    "create": false,
    "read": false,
    "update": false,
    "delete": false,
  }
  static ParentModel = User;
  static WhereFromDisplay(display: string) {
    return this.FlattenWhere(User.WhereFromDisplay(display), "User")
  }
  get display() {
    return (this.get("User") as User)?.display
  }
  static initialAttributes: KishiModelAttributes = {
    id: {
      type: KishiDataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  };
  static initialAssociations: { [key: string]: typesOfKishiAssociationOptions } = {
  };
}
