import { config } from "../../config";
import { Dialect, Sequelize } from "sequelize";
import { KishiDataType, KishiModel, KishiModelAttributeColumnOptions } from "../";
import fs from "fs"
import { AbstractFile, FileLib } from "../../utils/file";
import { randomUUID } from "crypto";
import Path from "path";
import axios from "axios";
const { uploadPath, server: { publicUrl } } = config;

export class FileType implements KishiDataType {
  ts_typeStr?: string = `{ key: string, url: string }`;
  isFile?: boolean = true;
  key = "FileType";
  dialect: Dialect = "mysql";
  dialectTypes = "mysql";
  modelName: string = "";
  attributeName: string = "";
  getters?: ((value: any) => any)[] = [];
  setters?: ((value: any) => any)[] = [];
  length: number = 64;
  constructor(length: number = 64) {
    if (length < 40)
      throw `File length shorter than 40`
    this.length = length
    return this;
  }
  Init(Model: typeof KishiModel, attribute: KishiModelAttributeColumnOptions): void {
    const { modelName, attributeName, length } = this
    //create directory
    fs.mkdirSync(`${uploadPath}/${modelName}_${attributeName}`, { recursive: true })
    attribute.fromView = ((value: { key: string, url: string }) => value?.url) as any
    attribute.get = function get() {
      const dataValue = this.getDataValue(attributeName) as string
      if (!dataValue) return dataValue
      if (dataValue.startsWith("url://"))
        return { key: dataValue, url: dataValue.slice(6) }
      return {
        key: dataValue,
        url: `${publicUrl}/${modelName}_${attributeName}/${dataValue}`,
      }
    }
    attribute.set = function set(file: AbstractFile | string) {
      if (!file) return
      if (typeof file == "string") {
        return this.setDataValue(attributeName, `url://${file}`)
      }
      file.name = `${randomUUID()}-${file.name.replace(/[^a-zA-Z0-9-_\.]/g, '')}`
      if (file.name.length > length) {
        const ext = Path.extname(file.name)
        if (ext.length < (length - 38))
          file.name = file.name.slice(0, length - ext.length) + ext
        else
          file.name = file.name.slice(0, length)
      }
      if (this as KishiModel) {
        (this as KishiModel).files[attributeName] = file
      }
      this.setDataValue(attributeName, file.name)
    }
  }
  Hook(Model: typeof KishiModel): void {
    const { modelName, attributeName, length } = this
    Model.beforeCreate(async (instance, options) => {
      const dataValue = instance.getDataValue(attributeName) as string
      if (dataValue?.startsWith("url://")) {
        const response = await axios.get(dataValue.slice(6), { responseType: "arraybuffer" })
        const blob = response.data as Blob
        instance.set(attributeName, { name: response.headers["content-type"].replace("/", "."), data: blob })
      }
    })
    Model.afterCreate(async (instance, options) => {
      if (instance.get(attributeName) && instance.files[attributeName]) {
        const file = instance.files[attributeName] as AbstractFile
        //save file
        FileLib.mv(file, `${uploadPath}/${modelName}_${attributeName}/${file.name}`)
        //always delete from files Record after save to avoid resetting
        delete instance.files[attributeName]
      }
    })
    Model.beforeUpdate(async (instance, options) => {
      const dataValue = instance.getDataValue(attributeName) as string
      if (dataValue?.startsWith("url://")) {
        const response = await axios.get(dataValue.slice(6), { responseType: "arraybuffer" })
        const blob = response.data as Blob
        instance.set(attributeName, { name: response.headers["content-type"].replace("/", "."), data: blob })
      }
      if (instance.files[attributeName]) {
        //updated file with the same name
        const file = instance.files[attributeName] as AbstractFile
        FileLib.mv(file, `${uploadPath}/${modelName}_${attributeName}/${file.name}`)
        delete instance.files[attributeName]
      }
    })
    Model.afterUpdate(async (instance, options) => {
      if (options.fields?.includes(attributeName)) {
        const previous = instance.previous(attributeName)
        if (previous) {
          //delete previous file
          fs.unlinkSync(`${uploadPath}/${modelName}_${attributeName}/${previous}`)
        }
      }
    })
  }
  public toString() {
    return `VARCHAR(${this.length})`;
  }
  public toSql(): string {
    return `VARCHAR(${this.length})`;
  }

  stringify = (value: any): string => {
    return value
  };
  get defaultValue() {
    const defaultValue = null as any;
    return defaultValue;
  }
}
(Sequelize as any).FileType = FileType;
