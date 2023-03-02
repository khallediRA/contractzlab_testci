import { ModelHooks } from "sequelize/types/hooks";
import { KishiModel, KishiModelAttributes, KishiDataTypes, KOp, typesOfKishiAssociationOptions, CrudOptions } from "../sequelize";

type ParamsType =
  { [key in string]: 'String' | 'Integer' | 'Bool' | 'Date' | 'Float' | 'FixedNumber:1' | 'FixedNumber:2' | 'FixedNumber:3' }
export const ts_ParamsTypeStr =
  "{ [key in string]: 'String' | 'Integer' | 'Bool' | 'Date' | 'Float' | 'FixedNumber:1' | 'FixedNumber:2' | 'FixedNumber:3' }"
export class SubClause extends KishiModel {
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
      unique: true,
    },
    isOptional: {
      type: KishiDataTypes.BOOLEAN,
    },
    params: {
      type: new KishiDataTypes.KJSON(),
      ts_typeStr: ts_ParamsTypeStr,
    },
    rawText: {
      type: KishiDataTypes.TEXT,
    },
  };
  static initialAssociations: { [key: string]: typesOfKishiAssociationOptions } = {
  };
  static initialHooks: Partial<ModelHooks<KishiModel, any>> = {
    async afterSync(options) {
    },
  }
}
