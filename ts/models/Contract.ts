import { ModelHooks } from "sequelize/types/hooks";
import { KishiModel, KishiModelAttributes, KishiDataTypes, KOp, typesOfKishiAssociationOptions, CrudOptions, KishiModelOptions } from "../sequelize";
import { isOfType } from "../utils/user";

export class Contract extends KishiModel {
  static crudOptions: CrudOptions = {
    "create": (user) => (isOfType(user, "Client")),
    "read": (user) => (isOfType(user, "Client") && { clientId: user?.id } || false),
    "update": (user) => (isOfType(user, "Client")),
    "delete": (user) => (isOfType(user, "Client")),
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
    name: {
      type: KishiDataTypes.STRING,
    },
    paramValues: {
      type:new KishiDataTypes.KJSON(),
    },
  };
  static initialAssociations: { [key: string]: typesOfKishiAssociationOptions } = {
    template: {
      type: "belongsTo",
      target: "ContractTemplate",
      foreignKey: "templateId",
      schemaMap: {
        "nested": "pure",
        "full": "nested",
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
    async afterSync(options) {
    },
  }
  static initialOptions: KishiModelOptions = {
    indexes: [{ fields: ["clientId", "name"], unique: true,name:"Contract_name" }]
  }
}
