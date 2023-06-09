import fs from "fs"
import { ModelHooks } from "sequelize/types/hooks";
import { KishiModel, KishiModelAttributes, KishiDataTypes, KOp, typesOfKishiAssociationOptions, CrudOptions, KishiModelOptions } from "../sequelize";
import { isOfType } from "../utils/user";
import { IContractAI, IContractAIForm, IUser } from "../interfaces";
import { AbstractFile } from "../utils/file";
import { PDFLib } from "../utils/pdf";
import { optimizeStr, replaceLast, startsWithIncensitive } from "../utils/string";
import DocxLib from "../utils/docx";
import { OpenAIService, chatCompletion } from "../services/openAPI";
import { ContractAIForm } from "./ContractAIForm";
import { cloneDeep } from "lodash";
import { CSVLib } from "../utils/csv";

export class ContractAI extends KishiModel {
  static getPromptSurvey(form: IContractAIForm) {
    const records = form.form?.map(([clause, subClause, question], idx) => {
      return {
        id: String(idx + 1),
        clause, subClause, question,
        answer: ""
      }
    }) || []
    return CSVLib.RecordsToCSVString(records)
  }

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
  static generateAIPrompt(row: IContractAI, fileContent: string): string {
    const optimizedContent = optimizeStr(fileContent)
    const promptSurvey = this.getPromptSurvey(row.form!)
    let prompt = `Generate a Legal Document based on the draft pdf file and a desired output.
Match the output format provided in clauses and subclaues
Expand each clause and subclause into a comprehensive legal document format
Language: Deduct from file.
[pdf file]
${optimizedContent}
[/pdf file]
[output]
${promptSurvey}
[/output]
    `
    return prompt
  }
  static async processAIResponse(row: IContractAI, completion: chatCompletion): Promise<void> {
    const content = completion.choices[0].message.content as string
    const [first, ...lines] = content.split("\n")
    const records = CSVLib.ParseLines(lines).map(([id, clause, subClause, question, answer]) => {
      return { id, clause, subClause, question, answer }
    })
    let answers = cloneDeep(row.form?.form)?.map((question, idx) => {
      let answer: string
      const record = records.find((record) => record.id == String(idx + 1))!
      answer = record?.answer
      if (answer) {
      } else {
        console.warn("question not found :", question);
      }
      return [...question, answer]
    })
    const summarySheet = answers
    row.summarySheet = summarySheet as any
    row.openAIId = completion.id
  }
  async handleNewFile() {
    (this as any)["form"] = await ContractAIForm.findByPk(this.get("formId") as any)
    if (!(this as any)["form"]) {
      throw `formId ${(this as any).formId} not found`
    }
    let file = this.files["file"] as AbstractFile
    const name = file.name
    const extension = file.name.split(".").pop()
    if (extension == "docx") {
      file.name = replaceLast(name, ".docx", ".pdf")
      file.data = await DocxLib.DocxToPdf(file.data)
      this.set("file", file)
    } else if (extension != "pdf") {
      throw `Unsupported file type ${extension}`
    }
    let textData = await PDFLib.PdfToText(file.data)
    const textFile = {
      name: replaceLast(name, `.${extension}`, ".txt"),
      data: textData
    }
    this.set("textFile", textFile)
    const prompt = await ContractAI.generateAIPrompt(this, textData)
    const now = Date.now()
    fs.writeFileSync(`tmp/${now}-file.txt`, textData)
    fs.writeFileSync(`tmp/${now}-prompt.txt`, prompt)
    const completion = await OpenAIService.ChatCompletion(prompt, "gpt-4")
    fs.writeFileSync(`tmp/${now}-ai.json`, JSON.stringify(completion))
    await ContractAI.processAIResponse(this, completion)
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
    openAIId: {
      type: KishiDataTypes.STRING,
    },
    summarySheet: {
      type: new KishiDataTypes.TEXT(),
      ts_typeStr: "[string, string, string, string][]",
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
    async beforeCreate(instance: ContractAI, options) {
      const user = (options as any).user as IUser
      instance.set("clientId", user?.id)
      if (instance.files["file"]) {
        await instance.handleNewFile()
      }
    },
    async beforeUpdate(instance: ContractAI, options) {
      if (options.fields?.includes("file") && instance.files["file"]) {
        await instance.handleNewFile()
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