import { ModelHooks } from "sequelize/types/hooks";
import { KishiModel, KishiModelAttributes, KishiDataTypes, KOp, typesOfKishiAssociationOptions, CrudOptions, KishiModelOptions } from "../sequelize";
import { isOfType } from "../utils/user";
import { IUser, IContract, IDocument } from "../interfaces";
import { Document } from "./Document";
import { Op } from "sequelize";
import { intersectionWith } from "lodash";

export class Contract extends KishiModel {
  static crudOptions: CrudOptions = {
    "create": (user) => (isOfType(user, "Client")),
    "read": (user) => (isOfType(user, "Client") && { clientId: user?.id } || false),
    "update": (user) => (isOfType(user, "Client") && { clientId: user?.id } || false),
    "delete": (user) => (isOfType(user, "Client") && { clientId: user?.id } || false),
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
    status: {
      type: KishiDataTypes.STRING,
    },
    name: {
      type: KishiDataTypes.STRING,
    },
    paramValues: {
      type: new KishiDataTypes.KJSON(),
    },
    excludedClauses: {
      type: new KishiDataTypes.KJSON(),
      ts_typeStr: "number[]",
    },
    excludedSubClauses: {
      type: new KishiDataTypes.KJSON(),
      ts_typeStr: "number[]",
    },
    annexes: {
      type: new KishiDataTypes.NAMEDFILES(),
      fromView: false,
    },
    fileNames: {
      type: KishiDataTypes.VIRTUAL,
      fromView: false,
      get() {
        return this.dataValues["fileNames"] || {}
      },
    },
    level1Id: {
      type: KishiDataTypes.INTEGER,
      binder: {
        hardBind: true,
        associationName: "template",
        targetField: "level1Id"
      }
    },
    level2Id: {
      type: KishiDataTypes.INTEGER,
      binder: {
        hardBind: true,
        associationName: "template",
        targetField: "level2Id"
      }
    },
    level3Id: {
      type: KishiDataTypes.INTEGER,
      binder: {
        hardBind: true,
        associationName: "template",
        targetField: "level3Id"
      }
    },
    clientId: {
      type: KishiDataTypes.UUID,
    },
    level: {
      type: KishiDataTypes.VIRTUAL,
      fromView: false,
      ts_typeStr: "3 | 2 | 1 | 0",
      get() {
        if (intersectionWith(Object.keys(this.dataValues), ["level1Id", "level2Id", "level3Id"]).length < 3)
          return undefined
        return this.dataValues["level3Id"] && 3 ||
          this.dataValues["level2Id"] && 2 ||
          this.dataValues["level1Id"] && 1 ||
          0
      },
    }
  };
  static initialAssociations: { [key: string]: typesOfKishiAssociationOptions } = {
    level1: {
      type: "belongsTo",
      target: "TypeLevel1",
      foreignKey: "level1Id",
      actionMap: { Create: null, Update: null, Link: null },
      schemaMap: {
        "nested": "pure",
      },
    },
    level2: {
      type: "belongsTo",
      target: "TypeLevel2",
      foreignKey: "level2Id",
      actionMap: { Create: null, Update: null, Link: null },
      schemaMap: {
        "nested": "pure",
      },
    },
    level3: {
      type: "belongsTo",
      target: "TypeLevel3",
      foreignKey: "level3Id",
      actionMap: { Create: null, Update: null, Link: null },
      schemaMap: {
        "nested": "pure",
      },
    },
    template: {
      type: "belongsTo",
      target: "ContractTemplate",
      foreignKey: "templateId",
      schemaMap: {
        "nested": "pure",
        "full": "full",
      },
    },
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
    afterCreate(instance) {

    },
    async afterFind(instancesOrInstance, options) {
      const paths = Contract.FindOptionsToPaths(options)
      if (!Array.isArray(instancesOrInstance) && paths.includes("template.clauses.subClauses.params")) {
        let fileFields: string[] = []
        let fileIds: number[] = []
        let instance = instancesOrInstance as KishiModel & IContract
        instance.template?.clauses?.forEach((clause) => {
          fileFields.push(...(clause.params?.filter(param => param.type == "file")?.map(param => param.name) || []))
          clause.subClauses?.forEach(subClause => {
            fileFields.push(...(subClause.params?.filter(param => param.type == "file")?.map(param => param.name) || []))
          });
        })
        const paramValues = instance.paramValues! as any
        fileIds = fileFields.map(field => paramValues[field]).filter(id => id)
        const files = await Document.findAll({ where: { id: { [Op.in]: fileIds } } }) as IDocument[]
        const fileNames = {} as any
        for (const file of files) {
          fileNames[file.id!] = file.name as string
        }
        instance.dataValues["fileNames"] = fileNames
      }
    },
    async afterSync(options) {
    },
  }
  static initialOptions: KishiModelOptions = {
    indexes: [
      { fields: ["clientId", "name"], unique: true, name: "Contract_name" },
      { fields: ["clientId", "status"], unique: false, name: "Contract_status" },
    ],
  }
}
