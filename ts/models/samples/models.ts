import { ModelHooks } from "sequelize/types/hooks";
import { KishiModel, KishiModelAttributes, KishiDataTypes, AttributeBinder, typesOfKishiAssociationOptions, CrudOptions } from "../../sequelize";
import { NotificationOptions } from "../../services/notification";
import { ElasticsearchOptions } from "../../services/elasticsearch";
import { literal } from "sequelize";
import { ParentA } from "./parents";
import { InterfaceA } from "./interfaces";
export class ModelA extends KishiModel {
  static InterfaceModels: (typeof KishiModel)[] = [InterfaceA];
  static ParentModel: typeof KishiModel = ParentA;
  static crudOptions: CrudOptions = {
  }
  static elasticsearchOptions: { [key: string]: ElasticsearchOptions } = {
    "ModelA": {
      name: "ModelA",
      paths: ["days", "data", "id", "createdAt", "updatedAt"],
      rowToData(row: ModelA) {
        return row.toView()
      },
      update: true,
    }
  }
  static notificationOptions: { onCreate?: NotificationOptions | undefined; onUpdate?: NotificationOptions | NotificationOptions[] | undefined; } = {
    onUpdate: [
      // {
      //   methods: ["mail"],
      //   async notificationData(row) {
      //     return {
      //       message: "ModelA data changed",
      //       metadata: { data: (row as any).data }
      //     }
      //   },
      //   async notifyUsers(row) {
      //     return ["User_as_foos"]
      //   },
      //   targetAttributes: ["data"]
      // }
    ]
  }
  static binders: AttributeBinder[] = [
    {
      source: "data",
      targetPath: "modelsB.data",
    },
  ]
  static initialAttributes: KishiModelAttributes = {
    id: {
      type: KishiDataTypes.UUID,
      defaultValue: KishiDataTypes.UUIDV4,
      primaryKey: true,
    },
    days: {
      type: new KishiDataTypes.MULTIENUM("Mon", "Tues", "Wendes", "Thurs", "Fri", "Satur", "Sun"),
    },
    geoPoint: {
      type: new KishiDataTypes.POINT(),
    },
    geoPolygon: {
      type: new KishiDataTypes.POLYGON(),
    },
    hashedPass: {
      type: new KishiDataTypes.HASH(8),
    },
    profilePhoto: { type: new KishiDataTypes.FILE() },
    documents: { type: new KishiDataTypes.FILES() },
    s3File: { type: new KishiDataTypes.S3FILE() },
    data: {
      type: new KishiDataTypes.KJSON(),
      allowNull: false,
    },
  };
  static initialAssociations: { [key: string]: typesOfKishiAssociationOptions } = {
    modelsB: {
      type: "hasMany",
      target: "ModelB",
      foreignKey: "modelAId",
      schemaMap: {
        "nested": "nested",
      },
      actionMap: {
        Create: "Create",
        Update: "UpsertDel",
        Link: "Add",
      }
    },
  };
}
export class ModelB extends KishiModel {
  static InterfaceModels: (typeof KishiModel)[] = [InterfaceA];
  static initialAttributes: KishiModelAttributes = {
    id: {
      type: KishiDataTypes.UUID,
      defaultValue: KishiDataTypes.UUIDV4,
      primaryKey: true,
    },
    data: {
      type: new KishiDataTypes.KJSON(),
    },
  };
}
export class ModelC extends KishiModel {
  static InterfaceModels: (typeof KishiModel)[] = [InterfaceA];
  static initialAttributes: KishiModelAttributes = {
    id: {
      type: KishiDataTypes.UUID,
      defaultValue: KishiDataTypes.UUIDV4,
      primaryKey: true,
    },
    data: {
      type: new KishiDataTypes.KJSON(),
    },
  };
  static initialHooks: Partial<ModelHooks<ModelA, any>> = {
    afterSync: async (options) => {
      try {
        const parentA1 = await ParentA.Create({
          ParentAType: "ModelA",
          ModelA: {
            data: { date: Date.now() },
          }
        })
        console.log("test parentA 1");
        console.log(parentA1.toView());
        const parentA2 = await ParentA.Create({
          ParentAType: "ModelA",
          ModelA: {
            days: 75,
          }
        })
        console.log("test parentA 2");
        console.log(parentA2.toView());
      } catch (error) {
        console.error(error);
      }
    },
  }
}
export class ModelD extends KishiModel {
  static initialAttributes: KishiModelAttributes = {
    id: {
      type: KishiDataTypes.UUID,
      defaultValue: KishiDataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: new KishiDataTypes.STRING(64),
    },
    text: {
      type: new KishiDataTypes.TEXT(),
      set(val) {
        return this.setDataValue("text",val)
      },
    },
    file: { type: new KishiDataTypes.FILE() },
  };
  static initialAssociations: { [key: string]: typesOfKishiAssociationOptions } = {
  };
}
