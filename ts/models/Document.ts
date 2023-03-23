import { ModelHooks } from "sequelize/types/hooks";
import { KishiModel, KishiModelAttributes, KishiDataTypes, KOp, typesOfKishiAssociationOptions, CrudOptions, KishiModelOptions } from "../sequelize";
import { isOfType } from "../utils/user";
import { IUser } from "../interfaces";

export class Document extends KishiModel {
  static crudOptions: CrudOptions = {
    "create": (user) => (isOfType(user, "Client")),
    "read": (user) => (isOfType(user, "Client") && { clientId: user?.id } || false),
    "update": (user) => (isOfType(user, "Client") && { clientId: user?.id } || false),
    "delete": (user) => (isOfType(user, "Client") && { clientId: user?.id } || false),
  }
  static WhereFromDisplay(display: string) {
    const parts = display.split(" ")
    return {
      name: { [KOp("or")]: parts.map(value => { return { [KOp("iLike")]: `%${value}%` } }) },      
    }
  }
  get display() {
    return this.get("fullName") as string
  }
  static initialAttributes: KishiModelAttributes = {
    id: {
      type: KishiDataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: KishiDataTypes.STRING,
      allowNull: false,
    },
    file: {
      type: new KishiDataTypes.FILE(),
      allowNull: true,
    }
  };
  static initialAssociations: { [key: string]: typesOfKishiAssociationOptions } = {
    client: {
      type: "belongsTo",
      target: "Client",
      foreignKey: "clientId",
      schemaMap: {
        "nested": "pure",
        "full": "pure",
      },
    },
  };
  static initialHooks: Partial<ModelHooks<KishiModel, any>> = {
    async beforeCreate(attributes, options) {
      const user = (options as any).user as IUser
      attributes.set("clientId", user?.id)
    },
    async afterSync(options) {
    },
  }
  static initialOptions: KishiModelOptions = {
    indexes: [{ fields: ["clientId", "name"], unique: true, name: "Document_name" }]
  }
}
