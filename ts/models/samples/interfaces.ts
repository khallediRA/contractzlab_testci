import { KishiDataTypes, KishiModel, KishiModelAttributes, typesOfKishiAssociationOptions } from "../../sequelize";

export class InterfaceA extends KishiModel {
  static initialAttributes: KishiModelAttributes = {
    id: {
      type: KishiDataTypes.UUID,
      defaultValue: KishiDataTypes.UUIDV4,
      primaryKey: true,
    },
    geoPoint: {
      type: new KishiDataTypes.POINT(),
    },
    data: {
      type: new KishiDataTypes.KJSON(),
    },
  };
  static initialAssociations: { [key: string]: typesOfKishiAssociationOptions } = {
  };
}