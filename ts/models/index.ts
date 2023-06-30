import { config } from "./../config";

import { Op, Sequelize } from "sequelize";

import { KishiModel } from "../sequelize";
import { forKey } from "../utils/object";
import { FileLogger } from "../utils/fileLogger";

const {
  db: { name, user, password, host, port, dialect, paranoid },
} = config;
const logger = new FileLogger("sequelize")

let operatorsAliases: any = {};
forKey(Op, (key, value) => {
  operatorsAliases["#" + key] = value;
});
export const sequelize = new Sequelize(name, user, password, {
  host,
  port,
  dialect,
  operatorsAliases,
  logging: (sql: string, queryObject: any) => {
    logger.log(sql)
  },
  define: { paranoid, freezeTableName: true },
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
});

//Initilize models

import { ExternalToken } from "./ExternalToken";
import { User } from "./User";
import { Admin } from "./users";
import { Client } from "./users";
import { Moderator } from "./users";
import { Notification, Notification_User } from "./Notification";
import { Event, Event_User } from "./Event";

import { TypeLevel1, TypeLevel2, TypeLevel3 } from "./typeLevels";
import { Clause } from "./Clause";
import { SubClause } from "./SubClause";
import { Contract } from "./Contract";
import { ContractAI } from "./ContractAI";
import { ContractAIForm } from "./ContractAIForm";
import { ContractAIResponse } from "./ContractAIResponse";
import { Beneficial } from "./Beneficial";
import { Document } from "./Document";
import { ContractTemplate, ContractTemplate_Clause } from "./ContractTemplate";
import { OpenAIResponseLog } from "./OpenAIResponseLog";
export { OpenAIResponseLog } from "./OpenAIResponseLog";

export { User } from "./User";
export { ExternalToken } from "./ExternalToken";
export { Notification, Notification_User } from "./Notification";
export { Event, Event_User } from "./Event";

export const models: {
  [name: string]: typeof KishiModel;
} = {
  OpenAIResponseLog,
  ExternalToken,
  User,
  Admin,
  Client,
  Moderator,
  Notification, Notification_User,
  TypeLevel1, TypeLevel2, TypeLevel3,
  Clause,
  SubClause,
  Contract,
  Beneficial,
  Document,
  ContractTemplate, ContractTemplate_Clause,
  ContractAI, ContractAIForm, ContractAIResponse,
  Event, Event_User,
};
for (const name in models) {
  models[name].Init(sequelize, models)
}

//Associate models
for (const modelName in models) {
  let Model = models[modelName];
  Model.Associate()
}
for (const modelName in models) {
  let Model = models[modelName];
  Model.PostAssociate()
}

export default {
  sequelize,
  ...models,
};
