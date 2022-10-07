
import fs from "fs"

import { models } from "../models";
import { KishiModel } from "../sequelize";
import { KArray } from "../utils/array";

const dirName = "ts/interfaces"

if (fs.existsSync(dirName))
    fs.rmSync(dirName, { recursive: true, force: true });
fs.mkdirSync(dirName, { recursive: true });
function interfacePath(Model: typeof KishiModel) {
    return `${dirName}/${Model.interfaceName}.ts`
}
const interfaceNames: string[] = []
for (const modelName in models) {
    const Model = models[modelName]
    interfaceNames.push(Model.interfaceName)
}
let indexStr = ""
for (const modelName in models) {
    if (modelName == "Admin")
        console.log("ZE WORDU!");
    const Model = models[modelName]
    let imports: [string, string][] = []
    let fields = Model.GetInterfaceFields()

    const associations = Model.finalAssociations;
    for (const associationName in associations) {
        const association = associations[associationName];
        let associationInterface = association.Target.interfaceName
        const associationFields = association.Target.GetInterfaceFields()
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
    let keysStr = `export const keysof${Model.interfaceName}: (keyof ${Model.interfaceName})[] = [${fields.map(([name, type]) => `"${name}"`).join(", ")}]\n`

    let interfaceStr = `export interface ${Model.interfaceName} {\n${fields.map(([name, type]) => `\t${name}?: ${type};\n`).join("")}\n}\n`
    for (const interfaceName of interfaceNames) {
        if (interfaceName == Model.interfaceName)
            continue
        if (interfaceStr.includes(interfaceName)) {
            imports.push([interfaceName, `./${interfaceName}`])
        }
    }
    let importStr = `${imports.map(([type, source]) => `import { ${type} } from "${source}";\n`).join("")}`
    indexStr += `export * from "./${Model.interfaceName}";\n`
    fs.writeFileSync(interfacePath(Model), importStr + interfaceStr + keysStr)
}
fs.writeFileSync(`${dirName}/index.ts`, indexStr)

