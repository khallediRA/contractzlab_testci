import { config } from "../config";

import { FindOptions, WhereAttributeHash } from "sequelize/types";
import { Router, RequestHandler } from "express";
import bodyParser from "body-parser";
import _ from "lodash";

import { CrudOptions, CrudResponse, KOp, KishiDataType, KishiModel } from "../sequelize";
import { flatToDeep } from "../utils/object";
import { KArray } from "../utils/array";
import { Middleware, MiddlewareChain, MiddlewareRequest } from "../utils/middleware";
import { UserAuthService } from "../services/userAuth";
import { User,ExternalToken } from "../models";
import { IUser } from "../interfaces";

export let router = Router();
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

export class ModelRouter {
  Model: typeof KishiModel;
  constructor(Model: typeof KishiModel) {
    this.Model = Model
  }
  Route(): Router {
    let router: Router = Router();
    const Model = this.Model
    let verifyUser: Middleware = async (req, res) => {
      const user = await UserAuthService.verifyToken(req).catch((err => null))
      req.middleData.user = user
      return user
    }
    let verifyCrud = (crud: keyof CrudOptions): Middleware => {
      return async (req, res) => {
        const user: (User & IUser) | null = req.middleData.user
        const crudOption = Model.crudOptions[crud] || true
        let crudResponse
        if (typeof crudOption == "function") {
          crudResponse = await crudOption(user || undefined)
        } else {
          crudResponse = crudOption
        }
        if (!crudResponse)
          throw { status: 403, message: "User Not Authorized" };
        req.middleData.crudResponse = crudResponse
        return crudResponse
      }
    }

    let parseFindOptions: Middleware = async (req, res) => {
      const crudResponse: true | WhereAttributeHash = req.middleData.crudResponse
      const schema: string = (req.query["schema"] || "pure") as string
      let findOptions: FindOptions = Model.SchemaToFindOptions(schema, true)
      const page: string = req.query["page"] as string;
      if (page) {
        const limit = Number(page.split(":")[0])
        let offset: number | undefined = limit * (Number(page.split(":")[1]) - 1)
        offset = offset != 0 ? offset : undefined
        findOptions.limit = limit
        findOptions.offset = offset
      } else {
      }
      const orderBy: string = req.query["orderBy"] as string
      if (orderBy) {
        const [name, order] = orderBy.split(":")
        findOptions.order = [[name, order]]
      } else {
      }
      const where = req.body?.where
      if (where) {
        const deepWhere = flatToDeep(where)
        let whereData = Model.FlattenWhere(deepWhere)
        findOptions.where = whereData
      }
      if (crudResponse != true) {
        findOptions.where = findOptions.where ? { [KOp("and")]: [findOptions.where, crudResponse] } : crudResponse
      }
      const group = req.query["group"] as string
      if (group) {
        findOptions.group = group
      }
      req.middleData.findOptions = findOptions
      return findOptions
    }
    let findById: Middleware = async (req, res) => {
      const findOptions: FindOptions = req.middleData.findOptions
      const id: string = req.query["id"] as string
      delete findOptions.where
      const row = await Model.findByPk(id, findOptions)
      if (!row)
        throw { message: `Instance Not Found` }
      req.middleData.row = row
      return { row: row.toView() }
    }
    let findAll: Middleware = async (req, res) => {
      const findOptions: FindOptions = req.middleData.findOptions
      const { rows, count } = await Model.findAndCountAll(findOptions)
      return { count, rows: Model.toView(rows) }
    }
    let count: Middleware = async (req, res) => {
      const findOptions: FindOptions = req.middleData.findOptions
      const count = await Model.count(findOptions)
      return { count }
    }
    let findOneWhere: Middleware = async (req, res) => {
      const findOptions: FindOptions = req.middleData.findOptions
      const row = await Model.findOne(findOptions)
      return { row: row?.toView() }
    }
    let uploadFile: (attributeName: string) => Middleware = (attributeName: string) => {
      return async (req, res) => {
        const fileType = Model.rawAttributes[attributeName].type as KishiDataType
        if (!req.files?.["file"])
          throw {
            message: "File Not Found",
            attributeName,
          };
        if (Array.isArray(req.files["file"]) && !fileType.isArray)
          throw {
            message: "Found Multiple Files",
            length: (req.files["file"] as any[]).length
          };
        const id: string = req.query["id"] as string
        let row = await Model.findByPk(id)
        if (!row)
          throw { message: `Instance Not Found` }
        row.set(attributeName, req.files["file"])
        await row.save()
        return { row: row.toView() }
      }
    }
    let deleteFile: (attributeName: string) => Middleware = (attributeName: string) => {
      return async (req, res) => {
        const fileType = Model.rawAttributes[attributeName].type as KishiDataType
        const id: string = req.query["id"] as string
        let row = await Model.findByPk(id)
        if (!row)
          throw { message: `Instance Not Found` }
        let toDelete = (req.body?.file || []) as any | any[]
        toDelete = Array.isArray(toDelete) ? toDelete : [toDelete]
        toDelete = KArray.toValues(toDelete, "key") as string[]
        let found = []
        let notFound = []

        let fileNames = fileType.isArray ? JSON.parse(row.getDataValue(attributeName) || "[]") : [row.getDataValue(attributeName)] as string[]
        found = KArray.intersection(fileNames, toDelete)
        notFound = KArray.minus(toDelete, found)
        const remainng = KArray.minus(fileNames, found)
        row.setDataValue(attributeName, fileType.isArray ? JSON.stringify(remainng) : (remainng[0] || null))
        await row.save()
        return { found, notFound, row: row.toView() }
      }
    }
    if (Model.WhereFromDisplay) {
      let findByDisplay: Middleware = async (req, res) => {
        const display: string = req.query["display"] as string
        const findOptions: FindOptions = req.middleData.findOptions
        if (display)
          findOptions.where = Model.WhereFromDisplay?.(display)
        const rows = await Model.findAll(findOptions)
        return { rows: Model.toView(rows) }
      }
      router.get("/byDisplay", MiddlewareChain(verifyUser, verifyCrud("read"), parseFindOptions, findByDisplay))
    }
    router.get("/", MiddlewareChain(verifyUser, verifyCrud("read"), parseFindOptions, findById))
    router.get("/all", MiddlewareChain(verifyUser, verifyCrud("read"), parseFindOptions, findAll))
    router.post("/all", MiddlewareChain(verifyUser, verifyCrud("read"), parseFindOptions, findAll))
    router.get("/count", MiddlewareChain(verifyUser, verifyCrud("read"), parseFindOptions, count))
    router.post("/count", MiddlewareChain(verifyUser, verifyCrud("read"), parseFindOptions, count))
    router.post("/one", MiddlewareChain(verifyUser, verifyCrud("read"), parseFindOptions, findOneWhere))
    for (const attributeName in Model.rawAttributes) {
      const fileType = Model.rawAttributes[attributeName].type as KishiDataType
      if (fileType?.isFile) {
        router.put(`/file/${attributeName}`, MiddlewareChain(verifyUser, verifyCrud("update"), uploadFile(attributeName)))
        router.delete(`/file/${attributeName}`, MiddlewareChain(verifyUser, verifyCrud("update"), deleteFile(attributeName)))
      }
    }

    let create: Middleware = async (req, res) => {
      const user: User | null = (req as any).user
      const crudResponse: CrudResponse = (req as any).crudResponse
      //
      let data = Model.fromView(req.body?.data) as any
      let created: KishiModel | null = null
      if (Model.parentOptions) {
        const type = data[Model.parentOptions.descriminator] as string
        if (!Model.parentOptions.models.includes(type))
          throw `Unvalid Child Type ${type}`
        const ChildModel = Model.models[type]
        created = await ChildModel.Create(data) as KishiModel
      } else {
        created = await Model.Create(data) as KishiModel
      }
      const schema: string = (req.query["schema"] || "pure") as string
      const findOptions = Model.SchemaToFindOptions(schema, true)
      const row = await Model.findByPk(created.id, findOptions)
      if (!row)
        throw { message: `Create Failed` }
      return { row: row.toView() }
    }
    let update: Middleware = async (req, res) => {
      const id: string = req.query["id"] as string
      const toUpdate = await Model.findByPk(id)
      if (!toUpdate)
        throw { message: `Instance Not Found` }
      let data = Model.fromView(req.body?.data) as any
      await toUpdate.Update(data)
      const schema: string = (req.query["schema"] || "pure") as string
      const findOptions = Model.SchemaToFindOptions(schema, true)
      const row = await Model.findByPk(toUpdate.id, findOptions)
      if (!row)
        throw { message: `Update Failed` }
      return { row: row.toView() }
    }
    let upsert: Middleware = async (req, res) => {
      let data = Model.fromView(req.body?.data) as any
      const [upserted, newRecord] = await Model.Upsert(data)
      const schema: string = (req.query["schema"] || "pure") as string
      const findOptions = Model.SchemaToFindOptions(schema, true)
      const row = await Model.findByPk(upserted.id, findOptions)
      if (!row)
        throw { message: `Upsert Failed` }
      return { newRecord, row: row.toView(), }
    }

    let destroy: Middleware = async (req, res) => {
      const id: string = req.query["id"] as string
      const toDestroy = await Model.findByPk(id)
      if (!toDestroy)
        throw { message: `Instance Not Found` }
      await toDestroy.destroy()
      return { deleted: true }
    }
    router.put("/", MiddlewareChain(verifyUser, verifyCrud("create"), create))
    router.patch("/", MiddlewareChain(verifyUser, verifyCrud("update"), update))
    router.delete("/", MiddlewareChain(verifyUser, verifyCrud("delete"), destroy))

    router.post("/Upsert", MiddlewareChain(verifyUser, verifyCrud("update"), upsert))

    return router;
  }
}