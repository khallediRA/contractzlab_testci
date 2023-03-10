import axios from "axios";
import { Router } from "express";
import fs from "fs"

export let router = Router();
//file upload dependencies
import bodyParser from "body-parser";
import { Middleware, MiddlewareChain, MiddlewareRequest } from "../utils/middleware";
import { ModelRouter } from "./Model";
import { KishiModel } from "../sequelize";
import { FindOptions } from "sequelize";
import { ContractTemplate, ContractTemplateResponse } from "../models/ContractTemplate";
import { IClause, IContractTemplate, ISubClause } from "../interfaces";
import { TypeLevel1, TypeLevel2, TypeLevel3 } from "../models/typeLevels";
import fileUpload from "express-fileupload";
import { randomUUID } from "crypto";
import { CSVLib } from "../utils/csv";

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

export class ReportRouter {

  static Route(): Router {
    let router: Router = Router();
    router.get("/exportContractTemplate", async (req, res) => {
      const { verifyUser, verifyCrud, parseFindOptions } = new ModelRouter(ContractTemplate)
      try {
        let _req = req as MiddlewareRequest
        _req.middleData = {}
        req.query["schema"] = "full"
        await verifyUser(_req, res)
        await verifyCrud("read")(_req, res)
        await parseFindOptions(_req, res)
        const findOptions: FindOptions = _req.middleData.findOptions
        const rows = await ContractTemplate.findAll(findOptions) as (ContractTemplate & IContractTemplate)[]
        let output: ContractTemplateResponse[] = []
        for (const row of rows) {
          output.push({
            name: row.name,
            language: row.language,
            level1: row.level1?.name,
            level2: row.level2?.name,
            level3: row.level3?.name,
            clauses: row.clauses?.map((clause) => {
              return {
                index: clause.ContractTemplate_Clause?.index,
                isOptional: clause.isOptional,
                name: clause.name,
                subClauses: clause.subClauses?.map((subClause) => {
                  return {
                    index: subClause.Clause_SubClause?.index,
                    isOptional: subClause.isOptional,
                    name: subClause.name,
                    rawText: subClause.rawText,
                    params: subClause.params,
                  }
                })
              }
            })
          })
        }
        res.status(200).send({ output })
      } catch (error) { console.error(error); res.status((error as any)?.status || 400).send(error) }

    })
    router.post("/csv/importContractTemplate", async (req, res) => {
      const { verifyUser, verifyCrud, parseFindOptions } = new ModelRouter(ContractTemplate)

      try {
        let _req = req as MiddlewareRequest
        _req.middleData = {}
        await verifyUser(_req, res)
        await verifyCrud("create")(_req, res)
        let file = req.files?.["file"] as fileUpload.UploadedFile
        if (!req.files?.["file"])
          throw "missing file"
        file = Array.isArray(file) ? file[0] : file
        console.log(file);

        const random = randomUUID()
        const extension = file.name.split(".").pop()
        if (extension == "xlsx") {
          await file.mv(`tmp/${random}.xlsx`)
          CSVLib.XlsxToCsv(`tmp/${random}.xlsx`, `tmp/${random}.csv`)
        } else {
          await file.mv(`tmp/${random}.csv`)
        }
        const records = await CSVLib.CsvToRecords(`tmp/${random}.csv`, "utf8")
        if (extension == "xlsx") {
          fs.unlinkSync(`tmp/${random}.xlsx`)
        }
        fs.unlinkSync(`tmp/${random}.csv`)
        let data: IContractTemplate = { clauses: [] }
        for (const record of records as any) {
          if (record["Id de la clause"] || record["Nom de la clause"]) {
            data.clauses?.push({
              ContractTemplate_Clause: { index: record["Id de la clause"] },
              name: record["Nom de la clause"] || undefined,
              subClauses: [],

            })
          }
          if (record["ID de la sous clause"] || record["Nom de la sous clause"]) {
            let clause = data.clauses?.[data.clauses.length - 1]
            clause?.subClauses?.push({
              Clause_SubClause: { index: record["ID de la sous clause"].split(".").pop() },
              name: record["Nom de la sous clause"] || undefined,
              rawText: record["Text de la sous clause"] ? [record["Text de la sous clause"]] : undefined,
              params: {}
            })
            const paramsMap: any = {
              "bool": "string",
              "date": "string",
              "text": "string",
            }
            if (!clause?.subClauses?.[clause?.subClauses?.length - 1].params) continue
            for (const key of ["Input utilisateur 1", "Input utilisateur 2", "Input utilisateur 3", "Input utilisateur 4"]) {
              if (!record["Text de la sous clause"]) continue
              const [name, type] = record[key].split(":")
              const paramTYpe = paramsMap[type];
              if (!paramTYpe) continue
              (clause.subClauses[clause.subClauses.length - 1].params as any)[name] = paramTYpe
            }
            if (Object.keys(clause.subClauses[clause.subClauses.length - 1].params as any).length == 0)
              delete clause.subClauses[clause.subClauses.length - 1].params
          }
        }
        const [upserted, newRecord] = await ContractTemplate.Upsert(data)
        res.send({ records, data, upserted })

      } catch (error) { console.error(error); res.status((error as any)?.status || 400).send(error) }

    })

    router.post("/importContractTemplate", async (req, res) => {
      const { verifyUser, verifyCrud, parseFindOptions } = new ModelRouter(ContractTemplate)
      try {
        let _req = req as MiddlewareRequest
        _req.middleData = {}
        await verifyUser(_req, res)
        await verifyCrud("create")(_req, res)

        await ContractTemplate.sequelize?.transaction(async (transaction) => {
          const data = req.body as ContractTemplateResponse
          let level1: KishiModel | null = await TypeLevel1.findOne({ where: { name: data.level1 }, transaction })
          if (!level1)
            level1 = await TypeLevel1.Create({ name: data.level1 }, { transaction })
          const level1Id = level1.id
          let level2: KishiModel | null = await TypeLevel2.findOne({ where: { name: data.level2 }, transaction })
          if (!level2)
            level2 = await TypeLevel2.Create({ name: data.level2, level1Id }, { transaction })
          const level2Id = level2.id
          let level3: KishiModel | null = await TypeLevel3.findOne({ where: { name: data.level3 }, transaction })
          if (!level3)
            level3 = await TypeLevel3.Create({ name: data.level3, level2Id }, { transaction })
          const level3Id = level3.id
          let createData: IContractTemplate = {
            language: data.language,
            name: data.name,
            level3Id: level3Id,
            clauses: [],
          }
          let clauses: IContractTemplate["clauses"] = []
          for (const _clasue of data.clauses || []) {
            let clause: KishiModel | null = await TypeLevel1.findOne({ where: { name: _clasue.name }, transaction })
          }
        })

      } catch (error) { console.error(error); res.status((error as any)?.status || 400).send(error) }

    })
    return router;
  }
}
