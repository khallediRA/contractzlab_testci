import { ModelHooks } from "sequelize/types/hooks";
import { KishiModel, KishiModelAttributes, KishiDataTypes, KOp, typesOfKishiAssociationOptions, CrudOptions } from "../../sequelize";
import { isOfType } from "../../utils/user";
import { dbSync } from "../../app";

const initData = [
  {
    name: "Contrat",
    levels2: [
      {
        name: "Achat",
        levels3: [
          { name: "Logiciel Saas" },
          { name: "Service" },
          { name: "Prestation scientifique" },
          { name: "Immobilier" },
        ]
      },
      {
        name: "Vente",
        levels3: []
      },
      {
        name: "Travail",
        levels3: []
      },
      {
        name: "Licence",
        levels3: []
      },
      {
        name: "Maintenance",
        levels3: []
      },
      {
        name: "Partenariat",
        levels3: []
      },
      {
        name: "Protection des données personelles",
        levels3: []
      },
    ]
  },
  { name: "SLA" },
  { name: "Bon de commande" },
  { name: "NDA" },
  { name: "Conditions générales d'utilisation" },
  { name: "Devis" },
  { name: "Facture" },
]

export class TypeLevel1 extends KishiModel {
  static crudOptions: CrudOptions = {
    "create": (user) => (isOfType(user, "Admin", "Moderator")),
    "read": true,
    "update": (user) => (isOfType(user, "Admin", "Moderator")),
    "delete": (user) => (isOfType(user, "Admin", "Moderator")),
  }
  static WhereFromDisplay(display: string) {
    const parts = display.split(" ")
    return {
      name: { [KOp("or")]: parts.map(value => { return { [KOp("iLike")]: `%${value}%` } }) },
    }
  }
  get display() {
    return this.get("name") as string
  }
  static initialAttributes: KishiModelAttributes = {
    id: {
      type: KishiDataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: KishiDataTypes.STRING,
      unique: true,
    },
  };
  static initialAssociations: { [key: string]: typesOfKishiAssociationOptions } = {
    levels2: {
      type: "hasMany",
      target: "TypeLevel2",
      foreignKey: "level1Id",
      schemaMap: {
        "full": "nested",
        "nested": "nested",
      },
      actionMap: {
        "Create": "Upsert",
        "Update": "Upsert",
      }
    },
  };
  static initialHooks: Partial<ModelHooks<KishiModel, any>> = {
    async afterSync(options) {
      dbSync.then(async () => {
        console.log("TypeLevel1.afterBulkSync");
        for (const row of initData) {
          await TypeLevel1.Upsert(row)
        }
      })
    },
    async beforeQuery(options, query) {
    }
  }
}
