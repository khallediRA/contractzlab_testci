import { ModelHooks } from "sequelize/types/hooks";
import { KishiModel, KishiModelAttributes, KishiDataTypes, KOp, typesOfKishiAssociationOptions, CrudOptions, KishiModelOptions } from "../sequelize";
import { isOfType } from "../utils/user";
import { IUser } from "../interfaces";

export class Beneficial extends KishiModel {
  static crudOptions: CrudOptions = {
    "create": (user) => (isOfType(user, "Client")),
    "read": (user) => (isOfType(user, "Client") && { clientId: user?.id } || false),
    "update": (user) => (isOfType(user, "Client")),
    "delete": (user) => (isOfType(user, "Client")),
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
      validate: { isEmail: true },
    },
    jobTitle: {
      type: KishiDataTypes.STRING(50),
    },
    passport: {
      type: KishiDataTypes.STRING(16),
    },
    cin: {
      type: KishiDataTypes.STRING(16),
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
    address: {
      type: new KishiDataTypes.KJSON(),
      ts_typeStr: '\
      {\
        "addressLine": string,\
        "postalCode": string,\
        "city": string,\
        "country": string,\
      }\
      ',
      toView(address: any) {
        if (!address) return address
        return {
          "addressLine": address.addressLine,
          "postalCode": address.postalCode,
          "city": address.city,
          "country": address.country,
        }
      },
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
    async beforeCreate(attributes, options) {
      const user = (options as any).user as IUser
      attributes.set("clientId", user?.id)
    },
    async afterSync(options) {
    },
  }
  static initialOptions: KishiModelOptions = {
    indexes: [{ fields: ["clientId", "name"], unique: true, name: "Beneficial_name" }]
  }
}
