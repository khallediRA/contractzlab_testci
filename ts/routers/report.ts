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
import { IContractTemplate, ISubClause, ITypeLevel1 } from "../interfaces";
import fileUpload from "express-fileupload";
import { randomUUID } from "crypto";
import { CSVLib } from "../utils/csv";
import { KishiModel } from "../sequelize";
import { TypeLevel1 } from "../models/typeLevels";

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

export class ReportRouter {

  static Route(): Router {
    let router: Router = Router();
    router.post("/importContractTemplate", async (req, res) => {
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

        let recordsPerContractTemplate
        const extension = file.name.split(".").pop()
        if (extension == "xlsx") {
          recordsPerContractTemplate = CSVLib.XlsxToRecords(file)
        } else if (extension == "csv") {
          const records = await CSVLib.CsvToRecords(file, "utf8")
          recordsPerContractTemplate = [records]
        } else {
          throw `Unspported file extension '${extension}'`
        }

        let rows: KishiModel[] = []
        let datas: IContractTemplate[] = []
        for (const records of recordsPerContractTemplate) {
          let data: IContractTemplate = {
            code: records[0]["Doc_code"],
            name: records[0]["Document_name"],
            clauses: [],
          }
          const level1Data: ITypeLevel1 = {
            name: records[0]["Document_type_level1"],
            levels2: records[0]["Document_type_level2"] && [{
              name: records[0]["Document_type_level2"],
              levels3: records[0]["Document_type_level3"] && [{
                name: records[0]["Document_type_level3"],
              }] || []
            }] || []
          }

          const [level1Upserted] = await TypeLevel1.Upsert(level1Data)
          const options = TypeLevel1.SchemaToFindOptions("full")
          const level1 = await TypeLevel1.findByPk(level1Upserted.id, options) as ITypeLevel1
          const level2 = level1.levels2?.find(({ name }) => name == records[0]["Document_type_level2"])
          const level3 = level2?.levels3?.find(({ name }) => name == records[0]["Document_type_level3"])
          data.level1Id = level1?.id
          data.level2Id = level2?.id || null as any
          data.level3Id = level3?.id || null as any

          let clauseIndex = 1
          let subClauseIndex = 1
          for (const record of records) {
            if (record["Clause_code"]) {
              subClauseIndex = 1
              data.clauses?.push({
                code: record["Clause_code"],
                ContractTemplate_Clause: { index: String(clauseIndex++), isOptional: record["Clause_Is_optional"] ? true : false },
                name: record["Clause_Name"] || undefined,
                rawText: [record["Clause_text1"]],
                subClauses: [],
              })
            }
            let params: ISubClause["params"] = []
            for (const idx of [1, 2, 3, 4]) {
              if (!record[`Param${idx}`] || !record[`Param${idx}_type`]) continue
              params.push({
                name: record[`Param${idx}`],
                label: record[`Param${idx}_label`] || record[`Param${idx}`],
                type: record[`Param${idx}_type`].toLowerCase() as any,
              })
            }
            let clause = data.clauses?.[data.clauses.length - 1]
            if (!clause) continue
            if (record["Sub_clause_name"] || record["Sub_clause_text1"]) {
              clause.subClauses?.push({
                index: String(subClauseIndex++),
                isOptional: record["Sub_Clause_Is_optional"] ? true : false,
                name: record["Sub_clause_name"] || undefined,
                rawText: [record["Sub_clause_text1"]],
                params,
              })
            } else if (record["Clause_code"]) {
              clause.params = params
            }
          }
          const [upserted, newRecord] = await ContractTemplate.Upsert(data)
          rows.push(upserted)
          datas.push(data)
        }
        res.send({ datas, rows: ContractTemplate.toView(rows) })
      } catch (error) { console.error(error); res.status((error as any)?.status || 400).send(error) }
    })

    router.get("/exportContractTemplate", async (req, res) => {
      const { verifyUser, verifyCrud, parseFindOptions } = new ModelRouter(ContractTemplate)

      try {
        let _req = req as MiddlewareRequest
        _req.middleData = {}
        await verifyUser(_req, res)
        await verifyCrud("read")(_req, res)
        _req.query["schema"] = "full"
        await parseFindOptions(_req, res)
        const findOptions: FindOptions = _req.middleData.findOptions
        const id: string = req.query["id"] as string
        delete findOptions.where
        const row = await ContractTemplate.findByPk(id, findOptions) as IContractTemplate
        let records: any[] = []
        let record: any = {
          "Doc_code": row.code,
          "Document_name": row.name,
          "Document_type_level1": row.level1?.name,
          "Document_type_level2": row.level2?.name,
          "Document_type_level3": row.level3?.name,
        }
        for (const clause of row.clauses || []) {
          record = {
            ...record,
            "Clause_code": clause.code,
            "Clause_index": clause.ContractTemplate_Clause?.index,
            "Clause_Is_optional": clause.ContractTemplate_Clause?.isOptional,
            "Clause_Name": clause.name
          }
          for (const idx in clause.rawText || []) {
            record[`Clause_text${(Number(idx) + 1)}`] = clause.rawText?.[idx]
          }
          if (clause.subClauses?.length) {
            for (const subClause of clause.subClauses) {
              record = {
                ...record,
                "Sub_clause_index": subClause.index,
                "Sub_Clause_Is_optional": subClause.isOptional,
                "Sub_clause_name": subClause.name
              }
              for (const idx in subClause.rawText || []) {
                record[`Sub_clause_text${(Number(idx) + 1)}`] = subClause.rawText?.[idx]
              }
              for (const idx in subClause.params || []) {
                const name = subClause.params?.[0].name
                const label = subClause.params?.[0].label
                const type = subClause.params?.[0].type
                record[`Param${(Number(idx) + 1)}`] = name
                record[`Param${(Number(idx) + 1)}_label`] = label
                record[`Param${(Number(idx) + 1)}_type`] = type
              }
              records.push(record)
              record = {}
            }
          } else {
            for (const idx in clause.params || []) {
              const name = clause.params?.[0].name
              const label = clause.params?.[0].label
              const type = clause.params?.[0].type
              record[`Param${(Number(idx) + 1)}`] = name
              record[`Param${(Number(idx) + 1)}_label`] = label
              record[`Param${(Number(idx) + 1)}_type`] = type
            }
            records.push(record)
            record = {}
          }
        }
        const path = `tmp/${id}.csv`
        CSVLib.RecordsToCSV(records, path, "utf8")
        res.send({ records, path })
      } catch (error) { console.error(error); res.status((error as any)?.status || 400).send(error) }
    })
    return router;
  }
}
