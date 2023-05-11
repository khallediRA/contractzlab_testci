import { ModelHooks } from "sequelize/types/hooks";
import { KishiModel, KishiModelAttributes, KishiDataTypes, KOp, typesOfKishiAssociationOptions, CrudOptions } from "../sequelize";
import { isOfType } from "../utils/user";
import { KArray } from "../utils/array";

export type ParamsType =
  {
    name: string,
    label: string,
    args?: any,
    type: 'string' | 'boolean' | 'list' | 'date' | 'number' | 'beneficial' | 'file'
  }[]
export const ts_ParamsTypeStr =
  "{\
    name: string,\
    label: string,\
    args?: any,\
    type: 'string' | 'boolean' | 'list' | 'date' | 'number' | 'beneficial' | 'file'\
  }[]"
export class SubClause extends KishiModel {
  static ProcessParams(text: string, params: ParamsType): string {
    const templateRegex = /\$(\w+)((?:\[(?:[^[\]]*)\])+)/;
    let matches = text.match(templateRegex);
    while (matches) {
      const [str, paramName, args_str] = matches;
      let param = params.find(({ name, type }) => name == paramName)
      if (!param) break
      const args = args_str.slice(1, -1).split("][")
      if (param.type == "boolean" && args.length == 2) {
        const [textIfTrue, textIfFalse] = args
        param.args = { textIfTrue, textIfFalse }
      } else if (param.type == "list") {
        param.args = []
        for (const arg of args) {
          if (arg.startsWith("!")) {
            param.args.push({ option: arg.slice(1), required: true })
          } else {
            param.args.push({ option: arg, required: false })
          }
        }
      }
      text = text.replace(str, `$${paramName}`)
      matches = text.match(templateRegex);
    }
    return text
  }
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
    index: KishiDataTypes.STRING(8),
    code: {
      type: KishiDataTypes.STRING,
      unique: true,
    },
    name: {
      type: KishiDataTypes.STRING,
    },
    isOptional: {
      type: KishiDataTypes.BOOLEAN,
      defaultValue: false,
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
