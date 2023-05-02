import { config } from "./config";

import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import bodyParser from "body-parser";
import morgan from "morgan";
import fs from "fs";

import { apiLogHandler } from "./routers/Handlers/apiLog";
import { ModelRouter } from "./routers/Model"
import { UtilsRouter } from "./routers/Utils";

import { sequelize, models } from "./models";

import { ElasticsearchService } from "./services/elasticsearch";
import { NotificationService } from "./services/notification";
import { QueryCacheService } from "./services/queryCache";
import { RedisService } from "./services/redis";
import { UserAuthService } from "./services/userAuth";
import { YouSignService } from "./services/youSign";
import { ZoomService } from "./services/zoom";
import { OSMRouter } from "./routers/osm";
import { ReportRouter } from "./routers/report";
import { ContractAIRouter } from "./routers/ContractAI";


const { uploadPath } = config;

export let router = express.Router();
export let app = express().use(router);
export const dbSync = sequelize.sync()

dbSync.then(async sequelize => {
  try {
    for (const modelName in models) {
      const prom = models[modelName].AfterSync?.(sequelize)
      if (prom)
        await prom
    }
  } catch (error) {
    console.error(error);
  } finally {
    return sequelize
  }
})

router.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    return callback(null, true);
  },
}));
router.use(morgan("dev"));
router.use(morgan("dev", { immediate: true }));

router.use(bodyParser.json({ limit: "50mb" }));
router.use(bodyParser.urlencoded({
  parameterLimit: 100000,
  limit: "50mb",
  extended: true,
}));

router.use(express.static("assets"));
router.use(express.static("public"));
router.use(express.static(uploadPath));
router.use(fileUpload({ createParentPath: true }));

router.use(apiLogHandler)

for (const name in models) {
  const modelRouter = new ModelRouter(models[name])
  router.use(`/${name}`, modelRouter.Route())
}
router.use(`/utils`, UtilsRouter.Route())
router.use("/osm", OSMRouter.Route())
router.use("/report", ReportRouter.Route())
router.use("/ContractAI", ContractAIRouter.Route())


// ElasticsearchService.Init(models, router)
NotificationService.Init(models, router)
// RedisService.Init(models,router)
QueryCacheService.Init(models, router)
UserAuthService.Init(models, router)
// YouSignService.Init(models, router)
// ZoomService.Init(models, router)
