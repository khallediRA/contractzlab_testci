import { ModelHooks } from "sequelize/types/hooks";
import { KishiModel, KishiModelAttributes, KishiDataTypes, KOp, typesOfKishiAssociationOptions, CrudOptions, KishiModelOptions } from "../sequelize";

export class Beneficial extends KishiModel {
  static crudOptions: CrudOptions = {
    "create": false,
    "read": false,
    "update": false,
    "delete": false,
  }
  static WhereFromDisplay(display: string) {
    const parts = display.split(" ")
    return {
      [KOp("or")]: {
        firstName: { [KOp("or")]: parts.map(value => { return { [KOp("iLike")]: `%${value}%` } }) },
        lastName: { [KOp("or")]: parts.map(value => { return { [KOp("iLike")]: `%${value}%` } }) },
      }
    }
  }
  get display() {
    return this.get("fullName") as string
  }
  static initialAttributes: KishiModelAttributes = {
    id: {
      type: KishiDataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: KishiDataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: KishiDataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    firstName: {
      type: KishiDataTypes.STRING(50),
    },
    lastName: {
      type: KishiDataTypes.STRING(50),
    },
    dateOfBirth: {
      type: KishiDataTypes.DATEONLY,
    },
    placeOfBirth: {
      type: KishiDataTypes.STRING(128),
    },
    fullName: {
      type: KishiDataTypes.VIRTUAL,
      fromView: false,
      ts_typeStr: "string",
      get() {
        const { firstName, lastName } = this as any;
        return firstName && lastName ? firstName + " " + lastName : null;
      },
    },
  };
  static initialAssociations: { [key: string]: typesOfKishiAssociationOptions } = {
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
    indexes: [{ fields: ["clientId", "name"], unique: true, name: "Beneficial_name" }]
  }
}
