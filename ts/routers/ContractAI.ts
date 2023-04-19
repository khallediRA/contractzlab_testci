import axios from "axios";
import { Router } from "express";
import fs from "fs"

export let router = Router();
//file upload dependencies
import bodyParser from "body-parser";
import { MiddlewareRequest } from "../utils/middleware";
import { ModelRouter } from "./Model";
import { FindOptions } from "sequelize";
import { ContractTemplate } from "../models/ContractTemplate";
import { IContractAI, IContractAIResponse } from "../interfaces";
import { ContractAI } from "../models/ContractAI";
import { KOp } from "../sequelize";
import { openai } from "../services/openAPI";
import { ContractAIResponse } from "../models/ContractAIResponse";

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

export class ContractAIRouter {
  static generateAIPrompt(row: IContractAI): string {
    if (!(row.file && row.answers && row.answers.length == row.form?.questions?.length))
      throw "missing data"
    return ""
  }

  static Route(): Router {
    let router: Router = Router();
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

        const row = await ContractTemplate.findOne(findOptions) as IContractAI
        if (!row)
          throw { message: `Instance Not Found` }
        const prompt = this.generateAIPrompt(row)
        const openAiResponse = await openai.createCompletion({
          model: "text-davinci-003",
          prompt: prompt,
          temperature: 0.2,
          max_tokens: 2000,
        })
        const data = openAiResponse.data
        let contractAIResponse: IContractAIResponse = {
          contractAIId: row.id,
          externalId: data.id,
          content: data.choices[0].text,
          info: {
            model: data.model,
            finish_reason: data.choices[0].finish_reason,
            ...data.usage,
          }
        }
        const createdResponse = await ContractAIResponse.Create(contractAIResponse, { user } as any)
        res.send({ row: createdResponse })
      } catch (error) { console.error(error); res.status((error as any)?.status || 400).send(error) }
    })
    return router;
  }
}
