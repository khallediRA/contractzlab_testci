import { ModelHooks } from "sequelize/types/hooks";
import { KishiModel, KishiModelAttributes, KishiDataTypes, KOp, typesOfKishiAssociationOptions, CrudOptions } from "../sequelize";
import { isOfType } from "../utils/user";


export class ContractAIForm extends KishiModel {
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
    language: {
      type: KishiDataTypes.ENUM("en", "fr"),
    },
    code: {
      type: KishiDataTypes.STRING,
      unique: true,
    },
    name: {
      type: KishiDataTypes.STRING,
    },
    form: {
      type: new KishiDataTypes.TEXT(),
      ts_typeStr: "[string, string, string][]",
      get() {
        return JSON.parse(this.getDataValue("form") || "[]")
      },
      set(value: [string, string, string][]) {
        value = value || []
        const data = Array.isArray(value) ? value : [value]
        this.setDataValue("form", JSON.stringify(data))
      },
    },
    level1Id: {
      type: KishiDataTypes.INTEGER,
      binder: {
        associationName: "level3",
        targetField: "level1Id"
      }
    },
    level2Id: {
      type: KishiDataTypes.INTEGER,
      binder: {
        associationName: "level3",
        targetField: "level2Id"
      }
    },
  };
  static initialAssociations: { [key: string]: typesOfKishiAssociationOptions } = {
    level3: {
      type: "belongsTo",
      target: "TypeLevel3",
      foreignKey: "level3Id",
      schemaMap: {
        "nested": "pure",
        "full": "full",
      },
      actionMap: {
        Create: "Upsert",
        Link: "Set",
        Update: "Upsert"
      },
    },
    level2: {
      type: "belongsTo",
      target: "TypeLevel2",
      foreignKey: "level2Id",
      actionMap: { Create: null, Update: null, Link: null },
      schemaMap: {
        "nested": "pure",
        "full": "pure",
      },
    },
    level1: {
      type: "belongsTo",
      target: "TypeLevel1",
      foreignKey: "level1Id",
      actionMap: { Create: null, Update: null, Link: null },
      schemaMap: {
        "nested": "pure",
        "full": "pure",
      },
    },
  };
  static initialHooks: Partial<ModelHooks<KishiModel, any>> = {
  }
}
const x = [
  ["Objet", "Quel est l'objet du contrat, les services demandés"],
  ["DOCUMENTS CONTRACTUELS", "Quels documents composent ce contrat ?"],
  ["PRISE D’EFFET – DUREE/Date d'effet", "Quand est-ce que ce contrat entre en vigueur ?"],
  ["PRISE D’EFFET – DUREE/Durée", "Quelle est la durée du contrat ?"],
  ["PRISE D’EFFET – DUREE/Reconduction", "La reconduction est-elle tacite ? Quels sont les délais ?"],
  ["SUPPORT – DISPONIBILITE - MAINTENANCE/Support", "Quels sont les conditions d'accés et d'intervention du support ?"],
  ["SUPPORT – DISPONIBILITE - MAINTENANCE/Disponiblité", "La disponibilité du service et ses exception"],
  ["SUPPORT – DISPONIBILITE - MAINTENANCE/Maintenance préventive", "Faut-il prévoir une maintenance préventive ?"],
  ["SUPPORT – DISPONIBILITE - MAINTENANCE/Maintenance Corrective", "Les conditions de la maintenance corrective, champ de couverture et exceptions,"],
  ["SUPPORT – DISPONIBILITE - MAINTENANCE/Maintenance évolutive - Mises à jour & Evolutions (Updates & Upgrades)", "La mainteneance évolutive est-elle payante ?"],
  ["LOCALISATION DES DONNEES ET PROPRIETE DES DONNEES/LOCALISATION DES DONNEES S", "Ou sont les données hébergées ?"],
  ["LOCALISATION DES DONNEES ET PROPRIETE DES DONNEES/Propriéte des données", "Qui est propriétaire des données fournies par le client ?"],
  ["COORDINATION DU CONTRAT ET SUIVI DES PRESTATIONS/Obligation de loyauté", ""],
  ["COORDINATION DU CONTRAT ET SUIVI DES PRESTATIONS/Obligation de Collaboration", ""],
  ["COORDINATION DU CONTRAT ET SUIVI DES PRESTATIONS/Suivi du contrat", "Les conséquences de désignation d'un correspondant"],
  ["COORDINATION DU CONTRAT ET SUIVI DES PRESTATIONS/Réunion de suivi", "Quelle est la périodicité et l'objet des réunions ? "],
  ["Obligation du prestataire/Conseil", "Quelues sont les obligations du prestataire en matiére de conseil"],
  ["Obligations générales", ""],
  ["Stipulations générales liées à la propriété intellectuelle", ""],
  ["Obligation de Collaboration", ""],
  ["Propriété intellectuelle/Stipulations générales liées à la propriété intellectuelle", "Qui est proprietaire du logicel"],
  ["Propriété intellectuelle/Droit d’utilisation du Service Hébergé", "Quelles sont les obligations du client ddans l'utilisation des services heberges"]
]

























