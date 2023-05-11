import { ModelHooks } from "sequelize/types/hooks";
import { KishiModel, KishiModelAttributes, KishiDataTypes, KOp, typesOfKishiAssociationOptions, CrudOptions, KishiModelOptions } from "../sequelize";
import { isOfType } from "../utils/user";
import { IContractTemplate } from "../views";

export class ContractTemplate extends KishiModel {
  static crudOptions: CrudOptions = {
    "create": (user) => (isOfType(user, "Admin", "Moderator")),
    "read": true,
    "update": (user) => (isOfType(user, "Admin", "Moderator")),
    "delete": (user) => (isOfType(user, "Admin", "Moderator")),
  }
  static WhereFromDisplay(display: string) {
    const parts = display.split(" ")
    return {
      name: { [KOp("or")]: parts.map(value => { return { [KOp("iLike")]: `%${value}%` } }) },
    }
  }
  static AfterView(row: KishiModel, view: IContractTemplate): any {
    view.clauses?.sort((a, b) => a.ContractTemplate_Clause?.index?.localeCompare(b.ContractTemplate_Clause?.index || "") || 0)
    return view
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
    language: {
      type: KishiDataTypes.ENUM("en", "fr"),
    },
    code: {
      type: KishiDataTypes.STRING,
      unique: true,
    },
    name: {
      type: KishiDataTypes.STRING,
    },
    level1Id: {
      type: KishiDataTypes.INTEGER,
      binder: {
        hardBind: false,
        associationName: "level2",
        targetField: "level1Id"
      }
    },
    level2Id: {
      type: KishiDataTypes.INTEGER,
      binder: {
        hardBind: false,
        associationName: "level3",
        targetField: "level2Id"
      }
    },
  };
  static initialAssociations: { [key: string]: typesOfKishiAssociationOptions } = {
    clauses: {
      type: "belongsToMany",
      target: "Clause",
      schemaMap: {
        "nested": "pure",
        "full": "nested",
      },
      actionMap: {
        Create: "Upsert",
        Link: "Set",
        Update: "UpsertRemove"
      },
      through: "ContractTemplate_Clause",
    },
    level3: {
      type: "belongsTo",
      target: "TypeLevel3",
      foreignKey: "level3Id",
      schemaMap: {
        "nested": "pure",
        "full": "full",
      },
      actionMap: {
        Create: "Upsert",
        Link: "Set",
        Update: "Upsert"
      },
    },
    level2: {
      type: "belongsTo",
      target: "TypeLevel2",
      foreignKey: "level2Id",
      actionMap: { Create: null, Update: null, Link: null },
      schemaMap: {
        "nested": "pure",
        "full": "pure",
      },
    },
    level1: {
      type: "belongsTo",
      target: "TypeLevel1",
      foreignKey: "level1Id",
      actionMap: { Create: null, Update: null, Link: null },
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
    index: KishiDataTypes.STRING(8),
    isOptional: {
      type: KishiDataTypes.BOOLEAN,
      defaultValue: false,
    },
  };
  static initialHooks: Partial<ModelHooks<KishiModel, any>> = {
    afterSync: async (options) => {
    }
  }
  static initialOptions: KishiModelOptions = {
  }
}
