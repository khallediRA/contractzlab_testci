import { ModelHooks } from "sequelize/types/hooks";
import { KishiModel, KishiModelAttributes, KishiDataTypes, KOp, typesOfKishiAssociationOptions, CrudOptions } from "../../sequelize";
import { User } from "../User";
export class Moderator extends KishiModel {
  static crudOptions: CrudOptions = {
    "create": false,
    "read": false,
    "update": false,
    "delete": false,
  }
  static ParentModel = User;
  static WhereFromDisplay(display: string) {
    return this.FlattenWhere(User.WhereFromDisplay(display))
  }
  get display() {
    return (this.get("User") as User)?.display
  }
  static initialAttributes: KishiModelAttributes = {
    id: {
      type: KishiDataTypes.UUID,
      primaryKey: true,
      defaultValue: KishiDataTypes.UUIDV4,
    },
  };
  static initialAssociations: { [key: string]: typesOfKishiAssociationOptions } = {
  };
  static initialHooks: Partial<ModelHooks<KishiModel, any>> = {
  }
}
