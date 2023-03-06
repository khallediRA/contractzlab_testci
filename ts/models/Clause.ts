import { ModelHooks } from "sequelize/types/hooks";
import { KishiModel, KishiModelAttributes, KishiDataTypes, KOp, typesOfKishiAssociationOptions, CrudOptions, KishiModelOptions } from "../sequelize";
import { isOfType } from "../utils/user";

export class Clause extends KishiModel {
  static crudOptions: CrudOptions = {
    "create": (user) => (isOfType(user, "Admin", "Moderator")),
    "read": (user) => (isOfType(user, "Admin", "Moderator")),
    "update": (user) => (isOfType(user, "Admin", "Moderator")),
    "delete": (user) => (isOfType(user, "Admin", "Moderator")),
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
      unique:true,
    },
    isOptional: {
      type: KishiDataTypes.BOOLEAN,
    },
  };
  static initialAssociations: { [key: string]: typesOfKishiAssociationOptions } = {
    subClauses: {
      type: "belongsToMany",
      target: "SubClause",
      schemaMap: {
        "nested": "pure",
        "full": "pure",
      },
      actionMap: {
        Create: "Update",
        Link: "Set",
        Update: "UpsertRemove"
      },
      through: "Clause_SubClause",
    },
  };
  static initialHooks: Partial<ModelHooks<KishiModel, any>> = {
    async afterSync(options) {
    },
  }
}
export class Clause_SubClause extends KishiModel {
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
    indexes: [{ fields: ["ClauseId", "SubClauseId", "index"], unique: true,name:"Clause_SubClause_index" }]
  }
}
