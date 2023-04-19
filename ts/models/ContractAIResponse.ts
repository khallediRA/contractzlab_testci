import { ModelHooks } from "sequelize/types/hooks";
import { KishiModel, KishiModelAttributes, KishiDataTypes, typesOfKishiAssociationOptions, CrudOptions, KishiModelOptions } from "../sequelize";
import { isOfType } from "../utils/user";

export class ContractAIResponse extends KishiModel {
  static crudOptions: CrudOptions = {
    "create": (user) => false,
    "read": (user) => (isOfType(user, "Client") && { "$contractAI.clientId$": user?.id } || false),
    "update": (user) => false,
    "delete": (user) => (isOfType(user, "Client") && { "$contractAI.clientId$": user?.id } || false),
  }
  static initialAttributes: KishiModelAttributes = {
    id: {
      type: KishiDataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    externalId: {
      type: KishiDataTypes.STRING,
    },
    info: {
      type: new KishiDataTypes.KJSON(),
    },
    content: {
      type: new KishiDataTypes.TEXT(),
    },
  };
  static initialAssociations: { [key: string]: typesOfKishiAssociationOptions } = {
    contractAI: {
      type: "belongsTo",
      target: "ContractAI",
      foreignKey: "contractAIId",
      schemaMap: {
        "nested": "pure",
        "full": "full",
      },
    },
  };
  static initialHooks: Partial<ModelHooks<KishiModel, any>> = {
  }
  static initialOptions: KishiModelOptions = {
  }
}
