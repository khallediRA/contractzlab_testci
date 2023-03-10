import { ModelHooks } from "sequelize/types/hooks";
import { KishiModel, KishiModelAttributes, KishiDataTypes, KOp, typesOfKishiAssociationOptions, CrudOptions } from "../sequelize";
import { isOfType } from "../utils/user";
import { KArray } from "../utils/array";

export type ParamsType =
  { [key in string]: 'text' | 'integer' | 'boolean' | 'date' | 'number' | 'fixedNumber:1' | 'fixedNumber:2' | 'fixedNumber:3' | 'beneficial' }
export const ts_ParamsTypeStr =
  "{ [key in string]: 'text' | 'integer' | 'boolean' | 'date' | 'number' | 'fixedNumber:1' | 'fixedNumber:2' | 'fixedNumber:3' | 'beneficial' }"
export class SubClause extends KishiModel {
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
    code: {
      type: KishiDataTypes.STRING,
      unique:true,
    },
    name: {
      type: KishiDataTypes.STRING,
    },
    isOptional: {
      type: KishiDataTypes.BOOLEAN,
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
  };
  static initialHooks: Partial<ModelHooks<KishiModel, any>> = {
    async afterSync(options) {
    },
  }
}
