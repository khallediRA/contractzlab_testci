
import fs from "fs"
import { DataTypes } from "sequelize";

import { models } from "../models";
import { isPCIR, isPI, KishiDataType, KishiModel, KishiModelAttributeColumnOptions } from "../sequelize";
import { KArray } from "../utils/array";

const interfacePath = "ts/interfaces"
const viewsPath = "ts/views"



function GetInterfaceFields(Model: typeof KishiModel): [string, string][] {
	let out: [string, string][] = []
	const attribtues = Model.getAttributes();
	// const queryGenerator = this.sequelize?.getQueryInterface().queryGenerator as any
	for (const attributeName in attribtues) {
		const attribute = attribtues[attributeName];
		const type = attribute.type
		let attTypeStr: string = "";
		const ts_typeStr = (attribute as any as KishiDataType).ts_typeStr
		if (ts_typeStr) {
			attTypeStr = ts_typeStr
		} else {
			const key = type.constructor.name as string
			switch (key as keyof typeof DataTypes) {
				case "CITEXT":
				case "STRING":
				case "TEXT":
				case "UUID":
				case "UUIDV1":
				case "UUIDV4":
					attTypeStr = "string"; break;
				case "INET":
				case "INTEGER":
				case "TINYINT":
					attTypeStr = "number"; break;
				case "BOOLEAN":
					attTypeStr = "boolean"; break;
				case "DATE":
				case "DATEONLY":
					attTypeStr = "Date"; break;
				case "ENUM":
					attTypeStr = ((type as any).values as string[]).map(value => `'${value}'`).join(" | "); break;
				default:
					attTypeStr = "any"
					console.warn(`${Model.name}.${attributeName}`);
					console.warn(type);
					break;
			}
		}
		out.push([attributeName, attTypeStr])
	}
	return out
}
const interfaceNames: string[] = []
for (const modelName in models) {
	const Model = models[modelName]
	interfaceNames.push(Model.interfaceName)
}
let indexStr = ""
function generateInterface(path: string) {
	if (fs.existsSync(path))
		fs.rmSync(path, { recursive: true, force: true });
	fs.mkdirSync(path, { recursive: true });
	for (const modelName in models) {
		const Model = models[modelName]
		let imports: [string, string][] = []
		let fields = GetInterfaceFields(Model)
		let piModels: string[] = []
		const associations = Model.finalAssociations;
		for (const associationName in associations) {
			const association = associations[associationName];
			let associationInterface = association.Target.interfaceName
			const associationFields = GetInterfaceFields(association.Target)
			let associationIdInterface = associationFields.find(([key]) => key == association.targetKey)?.[1] || "unknown"
			if (association.otherAssociation) {
				const omitAssociations = [association.otherAssociation, ...association.otherAssociation.exclusiveAssociations]
				const omitFields = [...KArray.get(omitAssociations, "as"), ...KArray.get(omitAssociations, "idName")].filter(omitField => omitField != "id")
				associationInterface = `Omit<${associationInterface}, ${omitFields.map(omitField => `"${omitField}"`).join(" | ")}>`
			}
			if (association.type == "belongsToMany") {
				associationInterface = `${associationInterface} & { ${association.Through.name}?: ${association.Through.interfaceName} }`
			}
			if (association.type.endsWith("Many")) {
				associationInterface = `(${associationInterface})[]`
				associationIdInterface = `(${associationIdInterface})[]`
			}
			fields.push([associationName, associationInterface])
			if (association.type != "belongsTo") {
				fields.push([association.idName, associationIdInterface])
			}
		}
		let body: string = ``
		let interfaceStr = `export interface ${Model.interfaceName} {\n${fields.map(([name, type]) => `\t${name}?: ${type};\n`).join("")}\n}\n`
		body = interfaceStr
		for (const interfaceName of interfaceNames) {
			if (interfaceName == Model.interfaceName)
				continue
			if (body.includes(interfaceName)) {
				imports.push([interfaceName, `./${interfaceName}`])
			}
		}
		let importStr = `${imports.map(([type, source]) => `import { ${type} } from "${source}";\n`).join("")}`
		indexStr += `export * from "./${Model.interfaceName}";\n`
		fs.writeFileSync(`${path}/${Model.interfaceName}.ts`, importStr + body)
	}
	fs.writeFileSync(`${path}/index.ts`, indexStr)
}
function generateView(path: string) {
	if (fs.existsSync(path))
		fs.rmSync(path, { recursive: true, force: true });
	fs.mkdirSync(path, { recursive: true });
	for (const modelName in models) {
		const Model = models[modelName]
		const attribtues = Model.getAttributes()
		let imports: [string, string][] = []
		let fields = GetInterfaceFields(Model)
		fields = fields.filter(([attributeName, type]) => {
			const attribute = attribtues[attributeName] as KishiModelAttributeColumnOptions;
			return (attribute.fromView != false) || (attribute.toView != false)
		})
		let piModels: string[] = []
		const associations = Model.finalAssociations;
		for (const associationName in associations) {
			const association = associations[associationName];
			let associationInterface = association.Target.interfaceName
			const associationFields = GetInterfaceFields(association.Target)
			let associationIdInterface = associationFields.find(([key]) => key == association.targetKey)?.[1] || "unknown"
			if (association.otherAssociation) {
				const omitAssociations = [association.otherAssociation, ...association.otherAssociation.exclusiveAssociations]
				const omitFields = [...KArray.get(omitAssociations, "as"), ...KArray.get(omitAssociations, "idName")].filter(omitField => omitField != "id")
				associationInterface = `Omit<${associationInterface}, ${omitFields.map(omitField => `"${omitField}"`).join(" | ")}>`
			}
			if (association.type == "belongsToMany") {
				associationInterface = `${associationInterface} & { ${association.Through.name}?: ${association.Through.interfaceName} }`
			}
			if (association.type.endsWith("Many")) {
				associationInterface = `(${associationInterface})[]`
				associationIdInterface = `(${associationIdInterface})[]`
			}
			if (isPCIR(association)) {
				if (isPI(association))
					piModels.push(associationInterface)
				continue
			}
			fields.push([associationName, associationInterface])
			if (association.type != "belongsTo") {
				fields.push([association.idName, associationIdInterface])
			}
		}
		let body: string = ``
		let piStr = piModels.map(name => `${name} & `).join('')
		let typeStr = `export type ${Model.interfaceName} = ${piStr}{\n${fields.map(([name, type]) => `\t${name}?: ${type};\n`).join("")}\n}\n`
		let keysStr = `export const keysof${Model.interfaceName}: (keyof ${Model.interfaceName})[] = [${fields.map(([name, type]) => `"${name}"`).join(", ")}]\n`
		body = typeStr + keysStr

		for (const interfaceName of interfaceNames) {
			if (interfaceName == Model.interfaceName)
				continue
			if (body.includes(interfaceName)) {
				imports.push([interfaceName, `./${interfaceName}`])
			}
		}
		let importStr = `${imports.map(([type, source]) => `import { ${type} } from "${source}";\n`).join("")}`
		indexStr += `export * from "./${Model.interfaceName}";\n`
		fs.writeFileSync(`${path}/${Model.interfaceName}.ts`, importStr + body)
	}
	fs.writeFileSync(`${path}/index.ts`, indexStr)
}
generateInterface(interfacePath)
generateView(viewsPath)


