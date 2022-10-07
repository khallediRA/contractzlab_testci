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
    logger.log(`${sql.slice("Executing (default): ".length)}`)
  },
  define: { paranoid, freezeTableName: true },
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
});

//Initilize models

import { User } from "./User";
import { Admin } from "./users";
import { Notification, Notification_User } from "./Notification";
import { Event, Event_User } from "./Event";
//test
import { ModelA, ModelB, ModelC, ModelD, InterfaceA, ParentA, StripeChargeRecord } from "./samples";

export { User } from "./User";
export { Admin } from "./users";
export { Notification, Notification_User } from "./Notification";
export { Event, Event_User } from "./Event";
export { ModelA, ModelB, ModelC, ModelD, InterfaceA, ParentA, StripeChargeRecord } from "./samples";

export var models: {
  [name: string]: typeof KishiModel;
} = {
  User,
  Admin,
  Notification, Notification_User,
  Event, Event_User,
  ModelA, ModelB, ModelC, ModelD, InterfaceA, ParentA, StripeChargeRecord,
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
