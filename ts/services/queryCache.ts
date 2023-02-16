import { config } from "../config";

import { Router } from "express";
import { CountOptions, FindOptions, GroupedCountResultItem } from "sequelize";
import { cloneDeep } from "lodash";

import { KishiModel } from "../sequelize";
import { FileLogger } from "../utils/fileLogger";
import { CacheLib, CachePayLoad } from "../utils/cache";
import { PromiseSub } from "../utils/promise";

const logger = new FileLogger("queryCache")

export class QueryCacheService {
	static Init(models: { [name: string]: typeof KishiModel }, router: Router) {
		async function findAll(this: typeof KishiModel, options?: FindOptions | undefined): Promise<KishiModel[] | KishiModel | null> {
			options = options || {}
			let cacheObject: any = cloneDeep(options)
			if (options.transaction) {
				return await (this as any).cache_findAll(options) as KishiModel[] | KishiModel | null
			}
			const cacheKey = this.name + ":" + JSON.stringify(cacheObject)
			const cache = await CacheLib.GetOrPromise(cacheKey, { timeout: 60 })
			if ("data" in (cache as CachePayLoad)) {
				logger.log("data from cache", cacheKey)
				return cloneDeep((cache as CachePayLoad).data) as KishiModel[] | KishiModel | null
			}
			const sub = cache as PromiseSub<[KishiModel[] | KishiModel | null, string[]]>
			try {
				const dependencies = this.FindOptionsToDependencies(options)
				const result = await (this as any).cache_findAll(options) as KishiModel[] | KishiModel | null
				sub.resolve([result, dependencies])
				return result
			} catch (error) {
				console.error(error);
				sub.reject(error)
				throw error
			}
		}
		async function count(this: typeof KishiModel, options?: CountOptions | undefined): Promise<number | GroupedCountResultItem[]> {
			options = options || {}
			let cacheObject: any = cloneDeep(options)
			if (options.transaction) {
				return await (this as any).cache_count(options) as number | GroupedCountResultItem[]
			}
			const cacheKey = this.name + ":" + JSON.stringify(cacheObject)
			const cache = await CacheLib.GetOrPromise(cacheKey, { timeout: 60 })
			if ("data" in (cache as CachePayLoad)) {
				return cloneDeep((cache as CachePayLoad).data) as number | GroupedCountResultItem[]
			}
			const sub = cache as PromiseSub<[number | GroupedCountResultItem[], string[]]>
			try {
				const dependencies = this.FindOptionsToDependencies(options)
				const result = await (this as any).cache_count(options) as number | GroupedCountResultItem[]
				sub.resolve([result, dependencies])
				return result
			} catch (error) {
				sub.reject(error)
				throw error
			}
		}
		for (const modelName in models) {
			const model = (models[modelName]);
			//Implement Cache
			(model as any).cache_findAll = (model as any).findAll.bind(model);
			(model as any).findAll = findAll.bind(model);
			(model as any).cache_count = (model as any).count.bind(model);
			(model as any).count = count.bind(model);
			model.afterCreate((row, options) => {
				logger.warn(model.name, "afterCreate");
				options.transaction?.afterCommit(() => CacheLib.ClearCacheByTag(model.name)) ||
					CacheLib.ClearCacheByTag(model.name)
			})
			model.afterUpdate((row, options) => {
				logger.warn(model.name, "afterUpdate");
				options.transaction?.afterCommit(() => CacheLib.ClearCacheByTag(model.name)) ||
					CacheLib.ClearCacheByTag(model.name)
			})
			model.afterDestroy((row, options) => {
				logger.warn(model.name, "afterDestroy");
				options.transaction?.afterCommit(() => CacheLib.ClearCacheByTag(model.name)) ||
					CacheLib.ClearCacheByTag(model.name)
			})
			model.afterBulkCreate((rows, options) => {
				logger.warn(model.name, "afterBulkCreate");
				options.transaction?.afterCommit(() => CacheLib.ClearCacheByTag(model.name)) ||
					CacheLib.ClearCacheByTag(model.name)
			})
			model.afterBulkUpdate((options) => {
				logger.warn(model.name, "afterBulkUpdate");
				options.transaction?.afterCommit(() => CacheLib.ClearCacheByTag(model.name)) ||
					CacheLib.ClearCacheByTag(model.name)
			})
			model.afterBulkDestroy((options) => {
				logger.warn(model.name, "afterBulkDestroy");
				options.transaction?.afterCommit(() => CacheLib.ClearCacheByTag(model.name)) ||
					CacheLib.ClearCacheByTag(model.name)
			})
		}
	}
}
