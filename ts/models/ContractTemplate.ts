import { ModelHooks } from "sequelize/types/hooks";
import { KishiModel, KishiModelAttributes, KishiDataTypes, KOp, typesOfKishiAssociationOptions, CrudOptions, KishiModelOptions } from "../sequelize";
import { User } from "./User";
export class ContractTemplate extends KishiModel {
  static crudOptions: CrudOptions = {
    "create": false,
    "read": true,
    "update": false,
    "delete": false,
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
  };
  static initialAssociations: { [key: string]: typesOfKishiAssociationOptions } = {
    clauses: {
      type: "belongsToMany",
      target: "Clause",
      schemaMap: {
        "nested": "pure",
        "full": "pure",
      },
      actionMap: {
        Create: "Update",
        Link: "Set",
        Update: "UpsertRemove"
      },
      through: "ContractTemplate_Clause",
    },
    typeLevel3: {
      type: "belongsTo",
      target: "TypeLevel3",
      foreignKey:"typeLevel3_id",
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
}
export class ContractTemplate_Clause extends KishiModel {
  static crudOptions: CrudOptions = {
    "create": false,
    "read": false,
    "update": false,
    "delete": false,
  }
  static initialAttributes: KishiModelAttributes = {
    id: {
      type: KishiDataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    index: KishiDataTypes.INTEGER,
  };
  static initialHooks: Partial<ModelHooks<KishiModel, any>> = {
    afterSync: async (options) => {
    }
  }
  static initialOptions: KishiModelOptions = {
    indexes: [{ fields: ["ContractTemplateId", "ClauseId", "index"], unique: true }]
  }
}
