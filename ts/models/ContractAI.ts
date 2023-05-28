import { ModelHooks } from "sequelize/types/hooks";
import { KishiModel, KishiModelAttributes, KishiDataTypes, KOp, typesOfKishiAssociationOptions, CrudOptions, KishiModelOptions } from "../sequelize";
import { isOfType } from "../utils/user";
import { IUser } from "../interfaces";
import { AbstractFile } from "../utils/file";
import { PDFLib } from "../utils/pdf";
import { replaceLast } from "../utils/string";
import DocxLib from "../utils/docx";

export class ContractAI extends KishiModel {

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
    file: {
      type: new KishiDataTypes.FILE(),
    },
    textFile: {
      type: new KishiDataTypes.FILE(),
    },
    summarySheet: {
      type: new KishiDataTypes.TEXT(),
      ts_typeStr: "[string, string][]",
      get() {
        return JSON.parse(this.getDataValue("summarySheet") || "[]")
      },
      set(value: string | [string, string][]) {
        value = value || []
        const data = Array.isArray(value) ? value : [value]
        this.setDataValue("summarySheet", JSON.stringify(data))
      },
    },
    clientId: {
      type: KishiDataTypes.UUID,
    }
  };
  static initialAssociations: { [key: string]: typesOfKishiAssociationOptions } = {
    form: {
      type: "belongsTo",
      target: "ContractAIForm",
      foreignKey: "formId",
      schemaMap: {
        "nested": "pure",
        "full": "full",
      },
    },
    responses: {
      type: "hasMany",
      target: "ContractAIResponse",
      foreignKey: "contractAIId",
      schemaMap: {
        "nested": null,
        "full": "pure",
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
    async beforeUpdate(instance, options) {
      if (instance.files["file"]) {
        let file = instance.files["file"] as AbstractFile
        const name = file.name
        const extension = file.name.split(".").pop()
        if (extension == "docx") {
          file.name = replaceLast(name, ".docx", ".pdf")
          file.data = await DocxLib.DocxToPdf(file.data)
          instance.set("file", file)
        } else if (extension != "pdf") {
          throw `Unsupported file type ${extension}`
        }
        const textFile = {
          name: replaceLast(name, `.${extension}`, ".txt"),
          data: await PDFLib.PdfToText(file.data)
        }
        instance.set("textFile", textFile)
      }
    },
    async afterSync(options) {
    },
  }
  static initialOptions: KishiModelOptions = {
    indexes: [
    ],
  }
}
