import fs from "fs"
import { ModelHooks } from "sequelize/types/hooks";
import { KishiModel, KishiModelAttributes, KishiDataTypes, KOp, typesOfKishiAssociationOptions, CrudOptions, KishiModelOptions } from "../sequelize";
import { isOfType } from "../utils/user";
import { IContractAI, IContractAIForm, IUser } from "../interfaces";
import { AbstractFile } from "../utils/file";
import { PDFLib } from "../utils/pdf";
import { optimizeStr, replaceLast, splitByMax } from "../utils/string";
import DocxLib from "../utils/docx";
import { OpenAIService, chatCompletion } from "../services/openAPI";
import { ContractAIForm } from "./ContractAIForm";
import { cloneDeep, intersectionWith } from "lodash";
import { CSVLib } from "../utils/csv";

const userPromptMaxLength = 8192 * 2
export class ContractAI extends KishiModel {
  static getPromptSurvey(form: IContractAIForm) {
    const records = form.form?.map(([clause, subClause, question], idx) => {
      if (question)
        return {
          id: String(idx + 1), question, answer: ""
        }
      const _question = [clause, subClause].filter(i => i).join(" - ") + "?"
      return {
        id: String(idx + 1), question: _question, answer: ""
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
  static generateAIPrompts(row: IContractAI, fileContent: string): [string, string] {
    const optimizedContent = optimizeStr(fileContent)
    const promptSurvey = this.getPromptSurvey(row.form!)
    let systemPrompt = row.form?.systemPrompt
      ?.replace("${form}", promptSurvey)!
    systemPrompt += "\nOUTPUT MUST BE IN CSV FORMAT\nLEAVE ANSWER EMPTY IF MISSING"
    let userPrompt = row.form?.userPrompt?.replace("${pdfFile}", optimizedContent)
      ?.replace("${form}", promptSurvey)!
    return [systemPrompt, userPrompt]
  }
  static async processAIMultiCallResponse(row: IContractAI, completions: chatCompletion[]): Promise<void> {
    let recordsMap: Record<string, {
      id: string;
      answer: string;
      options: string[];
    }> = {}
    for (const completion of completions) {
      const content = completion.choices[0].message.content as string
      const lines = content.split("\n")
      for (const line of lines) {
        try {
          const [id, question, answer] = CSVLib.ParseLine(line)
          const record = { id, answer, options: [answer] }
          if (!recordsMap[id])
            recordsMap[id] = record
          else if (record.answer) {
            recordsMap[id].options.push(record.answer)
          }
        } catch (error) { }
      }
    }
    const records = Object.values(recordsMap)
    let answers = cloneDeep(row.form?.form)?.map((question, idx) => {
      let answer: string
      const record = records.find((record) => record.id == String(idx + 1))!
      let options = [...new Set(record.options.filter(o => o))].sort((a, b) => b.length - a.length)
      answer = record.options[0] || ""
      if (answer) {
      } else {
        console.warn("question not found :", question);
      }
      return [...question, answer, options]
    })
    const summarySheet = answers
    row.summarySheet = summarySheet as any
  }
  static async processAIResponse(row: IContractAI, completion: chatCompletion): Promise<void> {
    const content = completion.choices[0].message.content as string
    const lines = content.split("\n")
    let records: any[] = []
    for (const line of lines) {
      try {
        let [id, question, answer] = CSVLib.ParseLine(line)
        answer = answer || question
        const record = { id, answer, options: [answer] }
        if (id)
          records.push(record)
      } catch (error) { }
    }
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
  }
  async handleNewFile() {
    let instance = this as ContractAI & IContractAI
    const formPaths = ["*", "level1.name", "level2.name", "level3.name"];
    const form = await ContractAIForm.findByPk(instance.formId, ContractAIForm.PathsToFindOptions(formPaths)) as IContractAIForm
    (this as any)["form"] = form
    if (!(this as any)["form"]) {
      throw `formId ${(this as any).formId} not found`
    }
    const level1Name = form.level1?.name
    const level2Name = form.level2?.name
    const level3Name = form.level3?.name
    const levels = [level1Name, level2Name, level3Name].filter(name => name).join("-")
    const sessionId = `${instance.clientId}-${levels}-${instance.name}`
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
    this.set("openAIId", sessionId)
    const [systemPrompt, userPrompt] = await ContractAI.generateAIPrompts(this, textData)
    const now = Date.now()
    fs.writeFileSync(`tmp/${now}-file.txt`, textData)
    if (userPrompt.length > userPromptMaxLength) {
      let multiMessages: any[][] = []
      const userPromptParts = splitByMax(userPrompt, userPromptMaxLength, "\n")
      multiMessages = userPromptParts.map((userPromptPart, idx) => {
        const systemPrompt_ = systemPrompt + `\nPART ${idx + 1}/${userPromptParts.length}:`
        fs.writeFileSync(`tmp/${now}-prompt-${idx}.txt`, `System:\n${systemPrompt_}\nUser:\n${userPromptPart}`)
        return [{ role: "system", content: systemPrompt_ }, { role: "user", content: userPromptPart }]
      })
      const completions = await OpenAIService.MultiChatCompletion(multiMessages, "gpt-4", sessionId)
      await completions.map(async (completion, idx) => {
        fs.writeFileSync(`tmp/${now}-ai-${idx}.json`, JSON.stringify(completion, null, "\t"))
        fs.writeFileSync(`tmp/${now}-ai-${idx}.text`, completion.choices[0].message.content as string)
      })
      await ContractAI.processAIMultiCallResponse(this, completions)
    } else {
      let messages: any[] = []
      if (systemPrompt)
        messages.push({ role: "system", content: systemPrompt })
      if (userPrompt)
        messages.push({ role: "user", content: userPrompt })
      fs.writeFileSync(`tmp/${now}-prompt.txt`, `System:\n${systemPrompt}\nUser:\n${userPrompt}`)
      const completion = await OpenAIService.ChatCompletion(messages, "gpt-4", sessionId)
      fs.writeFileSync(`tmp/${now}-ai.json`, JSON.stringify(completion, null, "\t"))
      fs.writeFileSync(`tmp/${now}-ai.text`, completion.choices[0].message.content as string)
      await ContractAI.processAIResponse(this, completion)
    }
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
    level1Id: {
      type: KishiDataTypes.INTEGER,
      binder: {
        hardBind: true,
        associationName: "form",
        targetField: "level1Id"
      }
    },
    level2Id: {
      type: KishiDataTypes.INTEGER,
      binder: {
        hardBind: true,
        associationName: "form",
        targetField: "level2Id"
      }
    },
    level3Id: {
      type: KishiDataTypes.INTEGER,
      binder: {
        hardBind: true,
        associationName: "form",
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
    form: {
      type: "belongsTo",
      target: "ContractAIForm",
      foreignKey: "formId",
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
    async beforeCreate(instance: ContractAI, options) {
      const user = (options as any).user as IUser
      instance.set("clientId", user?.id)
      const { clientId, name } = (instance as any)
      const existing = await ContractAI.findOne({ where: { clientId, name } })
      if (existing) {
        throw "ContractAI already exist"
      }
      if (instance.files["file"]) {
        await instance.handleNewFile()
      }
    },
    async beforeUpdate(instance: ContractAI, options) {
      if (options.fields?.includes("name")) {
        const { clientId, name } = (instance as any)
        const existing = await ContractAI.findOne({ where: { clientId, name } })
        if (existing) {
          throw "ContractAI already exist"
        }
      }
      if (options.fields?.includes("file") && instance.files["file"]) {
        await instance.handleNewFile()
      }
    },
    async afterSync(options) {
    },
  }
  static initialOptions: KishiModelOptions = {
    indexes: [
      //commented due to migration errors if duplicates already exist
      //uncomment for new database
      // { fields: ["name", "clientId"], unique: true, name: "ContractAI_name" }
    ],
  }
}