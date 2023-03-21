import { ModelHooks } from "sequelize/types/hooks";
import { KishiModel, KishiModelAttributes, KishiDataTypes, KOp, typesOfKishiAssociationOptions, CrudOptions, KishiModelOptions } from "../sequelize";
import { isOfType } from "../utils/user";
import { IUser } from "../interfaces";

export class Contract extends KishiModel {
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
    return this.get("name") as string
  }
  static initialAttributes: KishiModelAttributes = {
    id: {
      type: KishiDataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    status: {
      type: KishiDataTypes.STRING,
    },
    name: {
      type: KishiDataTypes.STRING,
    },
    paramValues: {
      type: new KishiDataTypes.KJSON(),
    },
    excludedClauses: {
      type: new KishiDataTypes.KJSON(),
      ts_typeStr: "number[]",
    },
    excludedSubClauses: {
      type: new KishiDataTypes.KJSON(),
      ts_typeStr: "number[]",
    },
    annexes: {
      type: new KishiDataTypes.NAMEDFILES(),
    },
    clientId: {
      type: KishiDataTypes.UUID,
    }
  };
  static initialAssociations: { [key: string]: typesOfKishiAssociationOptions } = {
    template: {
      type: "belongsTo",
      target: "ContractTemplate",
      foreignKey: "templateId",
      schemaMap: {
        "nested": "pure",
        "full": "full",
      },
    },
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
    indexes: [
      { fields: ["clientId", "name"], unique: true, name: "Contract_name" },
      { fields: ["clientId", "status"], unique: true, name: "Contract_status" },
    ],
  }
}
