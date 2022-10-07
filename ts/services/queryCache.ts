import { config } from "../config";

import { Router } from "express";
import { FindOptions } from "sequelize";
import { cloneDeep } from "lodash";

import { KishiModel } from "../sequelize";
import { FileLogger } from "../utils/fileLogger";
import { CacheLib, CachePayLoad } from "../utils/cache";
import { PromiseSub } from "../utils/promise";

const logger = new FileLogger("queryCache")

export class QueryCacheService {
	static Init(models: { [name: string]: typeof KishiModel }, router: Router) {
		async function _findAll(this: typeof KishiModel, options?: FindOptions | undefined): Promise<KishiModel[] | KishiModel | null> {
			options = options || {}
			const cacheKey = this.name + ":" + JSON.stringify(options)
			const cache = await CacheLib.GetOrPromise(cacheKey, { timeout: 60 })
			if ((cache as CachePayLoad)?.data) {
				logger.log("data from cache", cacheKey)
				return cloneDeep((cache as CachePayLoad).data) as KishiModel[] | KishiModel | null
			}
			const sub = cache as PromiseSub<[KishiModel[] | KishiModel | null, string[]]>
			try {
				const dependencies = this.FindOptionsToDependencies(options)
				const result = await (this as any).__findAll(options) as KishiModel[] | KishiModel | null
				sub.resolve([result, dependencies])
				return result
			} catch (error) {
				console.error(error);
				sub.reject(error)
				throw error
			}
		}
		for (const modelName in models) {
			const model = (models[modelName]);
			//Implement Cache
			(model as any).__findAll = (model as any)._findAll.bind(model);
			(model as any)._findAll = _findAll.bind(model);
			model.afterCreate(() => { logger.warn(model.name, "afterCreate"); CacheLib.ClearCacheByTag(model.name) })
			model.afterUpdate(() => { logger.warn(model.name, "afterUpdate"); CacheLib.ClearCacheByTag(model.name) })
			model.afterDestroy(() => { logger.warn(model.name, "afterDestroy"); CacheLib.ClearCacheByTag(model.name) })
			model.afterBulkCreate(() => { logger.warn(model.name, "afterBulkCreate"); CacheLib.ClearCacheByTag(model.name) })
			model.afterBulkUpdate(() => { logger.warn(model.name, "afterBulkUpdate"); CacheLib.ClearCacheByTag(model.name) })
			model.afterBulkDestroy(() => { logger.warn(model.name, "afterBulkDestroy"); CacheLib.ClearCacheByTag(model.name) })
		}
	}
}
