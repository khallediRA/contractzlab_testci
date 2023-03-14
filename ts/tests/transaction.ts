import { Transaction } from "sequelize";
import { sequelize, models } from "../models";
import { TypeLevel1 } from "../models/typeLevels";

export const dbSync = sequelize.sync()
dbSync.then(async () => {
  try {
    const name = new Date().toISOString()
    await TypeLevel1.sequelize?.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED }, async (t) => {
      await TypeLevel1.create({ name }, { transaction: t })
      console.log((await TypeLevel1.findAll({ where: { name } })));
      // await TypeLevel1.destroy({ where: { name }, transaction: t })
    })
  } catch (error) {
    console.error(error);
  }
})