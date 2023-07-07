import { config } from "../config";

import { groupBy } from "lodash";

import { KOp, KishiModel, KishiModelAttributeColumnOptions } from "../sequelize";


export class DataBinder {
	static async Init(models: { [name: string]: typeof KishiModel }) {
		for (const modelName in models) {
			const model = (models[modelName]);
			for (const attributeName in model.initialAttributes) {
				let attribute = model.initialAttributes[attributeName] as KishiModelAttributeColumnOptions
				attribute = attribute as KishiModelAttributeColumnOptions
				const binders = Array.isArray(attribute.binder) ? attribute.binder! : [attribute.binder!].filter(b => b)
				for (const binder of binders) {
					const { associationName, targetField } = binder
					const association = model.finalAssociations[associationName]
					const { Target } = association
					const { sourceKey, targetKey } = association
					let targetRows = await Target.findAll({ attributes: [targetKey, targetField] })
					const nullRowsTargetKeyIds = targetRows.filter(row => row.dataValues[targetField] == null).map(row => row.dataValues[targetKey])
					targetRows = targetRows.filter(row => row.dataValues[targetField] != null)
					const targetRowsPerValue = groupBy(targetRows, (row) => row.dataValues[targetField])
					for (const value in targetRowsPerValue) {
						const targetKeyIds = [...new Set(targetRowsPerValue[value].map(row => row.dataValues[targetKey]))]
						await model.update({ [attributeName]: value }, { where: { [sourceKey]: { [KOp("in")]: targetKeyIds } } })
					}
					if (binder.hardBind && nullRowsTargetKeyIds.length) {
						await model.update({ [attributeName]: null }, { where: { [sourceKey]: { [KOp("in")]: nullRowsTargetKeyIds } } })

					}
				}
			}
		}
	}
}
