import { Router } from "express";
import fs from "fs"

export let router = Router();
//file upload dependencies
import bodyParser from "body-parser";
import { MiddlewareRequest } from "../utils/middleware";
import { ModelRouter } from "./Model";
import { FindOptions } from "sequelize";
import { IContractAI, IContractAIResponse } from "../interfaces";
import { ContractAI } from "../models/ContractAI";
import { KOp } from "../sequelize";
import { OpenAIService, openai } from "../services/openAPI";
import { ContractAIResponse } from "../models/ContractAIResponse";
import { PDFToTextLib } from "../services/pdfToText";
import fileUpload from "express-fileupload";
import { UrlToUploadPath, optimizeStr } from "../utils/string";

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

const maxTokens = 8191

export class ContractAIRouter {
  static async generateAIPrompt(row: IContractAI, fileContent: string): Promise<string> {
    const form = row.form?.form!
    let prompt = `
Generate a Legal Document based on the draft pdf file and a desired output.
Match the output format provided in clauses and subclaues
Expand each clause and subclause into a comprehensive legal document format
Language: Deduct from file.
[pdf file]
${optimizeStr(fileContent)}
[/pdf file]
[output]
${form.map(([clause, text]) => `${clause}:${text}`).join("\n")}
[/output]
    `
    return prompt
  }
  static async processAIResponse(row: IContractAI, response: string): Promise<any> {
    const summarySheet = response.split("\n")
      .filter((str) => str)
      .map((line) => line.split(":").map(str => str.trim()))
    row.summarySheet = summarySheet as any
    return summarySheet
  }
  static Route(): Router {
    let router: Router = Router();
    router.get("/models", async (req, res) => {

    })

    router.post("/generateAIResponse", async (req, res) => {
      const { verifyUser, verifyCrud, parseFindOptions } = new ModelRouter(ContractAI)
      try {
        let _req = req as MiddlewareRequest
        _req.middleData = {}
        await verifyUser(_req, res)
        await verifyCrud("update")(_req, res)
        const user = _req.middleData.user
        _req.query["schema"] = "full"
        await parseFindOptions(_req, res)
        const findOptions: FindOptions = _req.middleData.findOptions
        const id: string = req.query["id"] as string
        findOptions.where = findOptions.where ? { [KOp("and")]: [findOptions.where, { id }] } : { id }

        const row = await ContractAI.findOne(findOptions) as IContractAI & ContractAI
        if (!row)
          throw { message: `Instance Not Found` }
        let pdfFile: Buffer | string | undefined = (req.files?.["file"] as fileUpload.UploadedFile)?.data
        if (!pdfFile) {
          pdfFile = UrlToUploadPath((row as IContractAI).file?.url!)
        } else {
          row.set("file", req.files?.["file"])
          await row.save()
        }
        if (!pdfFile)
          return
        const fileContent = await PDFToTextLib.PdfToText(pdfFile)

        const prompt = await this.generateAIPrompt(row, fileContent)
        const tokens = prompt.length
        // return res.send({tokens, prompt })

        if (tokens > maxTokens)
          throw {
            message: `This model's maximum context length is ${maxTokens} tokens, however you requested ${tokens} tokens`
          }
        const openAiData = await OpenAIService.ChatCompletion(prompt, "gpt-4")
        const now = Date.now()
        fs.writeFileSync(`tmp/${now}-file.txt`, fileContent)
        fs.writeFileSync(`tmp/${now}-prompt.txt`, prompt)
        fs.writeFileSync(`tmp/${now}-ai.txt`, openAiData.choices[0].message.content)
        this.processAIResponse(row, openAiData.choices[0].message.content)
        await row.save()
        return res.send({ now, prompt, openAiData, row: row.toView() })
      } catch (error) {
        console.error(error);
        if ((error as any)?.response?.data)
          return res.status((error as any)?.response?.status || 400).send((error as any)?.response?.data)
        return res.status((error as any)?.status || 400).send(error)
      }
    })
    return router;
  }
}
