import { ModelHooks } from "sequelize/types/hooks";
import { KishiModel, KishiModelAttributes, KishiDataTypes, KOp, typesOfKishiAssociationOptions, CrudOptions, KishiModelOptions } from "../sequelize";
import { isOfType } from "../utils/user";
import { SubClause, ts_ParamsTypeStr } from "./SubClause";
import { IClause } from "../views";

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
  static AfterView(row: KishiModel, view: IClause): any {
    view.subClauses?.sort((a, b) => a.index?.localeCompare(b.index || "") || 0)
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
    code: {
      type: KishiDataTypes.STRING,
      unique: true,
    },
    name: {
      type: KishiDataTypes.STRING,
    },
    params: {
      type: new KishiDataTypes.KJSON(),
      ts_typeStr: ts_ParamsTypeStr,
    },
    rawText: {
      type: new KishiDataTypes.TEXT(),
      ts_typeStr: "string[]",
      get() {
        return JSON.parse(this.getDataValue("rawText") || "[]")
      },
      set(value: string | string[]) {
        value = value || []
        const data = Array.isArray(value) ? value : [value]
        this.setDataValue("rawText", JSON.stringify(data))
      },
    },
  };
  static initialAssociations: { [key: string]: typesOfKishiAssociationOptions } = {
    subClauses: {
      type: "hasMany",
      target: "SubClause",
      foreignKey: "clauseId",
      schemaMap: {
        "nested": "pure",
        "full": "nested",
      },
      actionMap: {
        Create: "Create",
        Link: null,
        Update: "UpsertDel"
      },
    },
  };
  static initialHooks: Partial<ModelHooks<KishiModel, any>> = {
    beforeValidate(instance, options) {
      const params: any = instance.get("params")
      let rawText: string[] = instance.get("rawText") as string[]
      if (params && rawText?.[0]) {
        const processedText = SubClause.ProcessParams(rawText[0], params)
        if (rawText[0] != processedText) {
          rawText[0] = processedText
          options.fields?.push("rawText", "params")
          instance.set("rawText", [...rawText])
          instance.set("params", params)
        }
      }
    },
    async afterSync(options) {
    },
  }
}
