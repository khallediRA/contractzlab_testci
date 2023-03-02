import { ModelHooks } from "sequelize/types/hooks";
import { KishiModel, KishiModelAttributes, KishiDataTypes, KOp, typesOfKishiAssociationOptions, CrudOptions } from "../../sequelize";
import { User } from "../User";

export class TypeLevel1 extends KishiModel {
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

    levels2: {
      type: "hasMany",
      target: "TypeLevel2",
      foreignKey: "level1Id",
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
