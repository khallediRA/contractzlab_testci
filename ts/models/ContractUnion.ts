import { intersectionWith } from "lodash";
import { KishiModel, KishiModelAttributes, KishiDataTypes, typesOfKishiAssociationOptions, CrudOptions, KishiModelOptions } from "../sequelize";
import { isOfType } from "../utils/user";
import { Contract } from "./Contract";
import { ContractAI } from "./ContractAI";
export class ContractUnion extends KishiModel {
  static crudOptions: CrudOptions = {
    "create": false,
    "read": (user) => (isOfType(user, "Client") && { clientId: user?.id } || false),
    "update": false,
    "delete": false,
  }
  static ContractUnionType = ["Contract", "ContractAI"]
  static initialAttributes: KishiModelAttributes = {
    id: {
      type: KishiDataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    type: KishiDataTypes.ENUM(...this.ContractUnionType),
    clientId: KishiDataTypes.UUID,
    name: {
      type: KishiDataTypes.STRING,
      binder: [
        { associationName: "contract", targetField: "name" },
        { associationName: "contractAI", targetField: "name" },
      ]
    },
    status: {
      type: KishiDataTypes.STRING,
      binder: [
        { associationName: "contract", targetField: "status" },
        { associationName: "contractAI", targetField: "status" },
      ]
    },
    level1Id: {
      type: KishiDataTypes.INTEGER,
      binder: [
        { associationName: "contract", targetField: "level1Id" },
        { associationName: "contractAI", targetField: "level1Id" },
      ]
    },
    level2Id: {
      type: KishiDataTypes.INTEGER,
      binder: [
        { associationName: "contract", targetField: "level2Id" },
        { associationName: "contractAI", targetField: "level2Id" },
      ]
    },
    level3Id: {
      type: KishiDataTypes.INTEGER,
      binder: [
        { associationName: "contract", targetField: "level3Id" },
        { associationName: "contractAI", targetField: "level3Id" },
      ]
    },
    updatedAt: {
      type: KishiDataTypes.DATE,
      binder: [
        { associationName: "contract", targetField: "updatedAt" },
        { associationName: "contractAI", targetField: "updatedAt" },
      ]
    },
    createdAt: {
      type: KishiDataTypes.DATE,
      binder: [
        { associationName: "contract", targetField: "createdAt" },
        { associationName: "contractAI", targetField: "createdAt" },
      ]
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
    },
  };
  static initialAssociations: { [key: string]: typesOfKishiAssociationOptions } = {
    contract: {
      type: "belongsTo",
      target: "Contract",
      foreignKey: "contractId",
      schemaMap: {
        "nested": null,
        "full": null,
      },
    },
    contractAI: {
      type: "belongsTo",
      target: "ContractAI",
      foreignKey: "contractAIId",
      schemaMap: {
        "nested": null,
        "full": null,
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
    level3: {
      type: "belongsTo",
      target: "TypeLevel3",
      foreignKey: "level3Id",
      actionMap: { Create: null, Update: null, Link: null },
      schemaMap: {
        "nested": "pure",
        "full": "pure",
      },
    },
  };
  static initialOptions: KishiModelOptions = {
    timestamps:false,
    indexes: [
      { fields: ["type", "contractId"], unique: true, name: "ContractUnion_contract" },
      { fields: ["type", "contractAIId"], unique: true, name: "ContractUnion_contractAI" },
    ]
  }
  static async AfterSync() {
    console.log("TypeLevel1.afterBulkSync");
    const fieldMap: any = {
      "Contract": "contractId",
      "ContractAI": "contractAIId",
    }
    const fields = ["clientId", "name", "level1Id", "level2Id", "level3Id", "clientId"]
    for (const Model of [Contract, ContractAI]) {
      const fieldName = fieldMap[Model.name]
      const modelCount = await Model.count()
      const unionCount = await this.count({ where: { type: Model.name } })
      if (modelCount != unionCount) {
        let bulkData = (await Model.findAll({ attributes: ["id", ...fields] })).map(row => {
          const { id, clientId, name, level1Id, level2Id, level3Id } = row.dataValues
          return { [fieldName]: id, type: Model.name, clientId, name, level1Id, level2Id, level3Id }
        })
        const duplicates = await this.findAll({ attributes: [fieldName, "type"], where: { type: Model.name } })
        bulkData = bulkData.filter(data => !duplicates.find(duplicate => duplicate.dataValues[fieldName] == data[fieldName]))
        if (bulkData.length)
          await this.bulkCreate(bulkData, { ignoreDuplicates: true })
      }
      Model.afterCreate(async (instance, options) => {
        let data: any = {
          type: Model.name,
          [fieldName]: instance.id,
        }
        for (const field of fields) {
          data[field] = instance.dataValues[field]
        }
        await this.create(data, { transaction: options.transaction })
      })
    }
  }
}
