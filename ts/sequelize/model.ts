import { cloneDeep, defaults } from "lodash";
import {
  Model,
  Sequelize,
  Attributes,
  WhereOptions,
  ForeignKeyOptions,
  FindOptions,
  IncludeOptions,
  CreateOptions,
  InstanceUpdateOptions,
  Association,
  IndexesOptions,
  CountOptions,
  FindAndCountOptions,
  DataTypes,
  UpdateOptions,
} from "sequelize";
import { ModelHooks } from "sequelize/types/hooks";
import { IUser } from "../interfaces";
import { KArray } from "../utils/array";
import { AbstractFile } from "../utils/file";
import { pathConcat, pathHead } from "../utils/string";
import { KishiDataTypes } from "./DataTypes";
import { AttributeBinder, initDataType, KishiAssociation, typesOfKishiAssociationOptions, KishiBelongsTo, KishiBelongsToMany, KishiBelongsToManyOptions, KishiBelongsToOptions, KishiDataType, KishiHasMany, KishiHasManyOptions, KishiHasOne, KishiHasOneOptions, KishiModelAttributeColumnOptions, KishiModelAttributes, KishiModelOptions, KOp, SplitAssociationPoint, CrudOptions, CrudOption, FinalAssociation, isPCIR, isPI } from "./types";

export class KishiModel extends Model {
  static parentOptions?: {
    descriminator: string;
    models: string[];
    allowNull?: boolean;
  };
  static ParentModel?: typeof KishiModel;
  static InterfaceModels?: (typeof KishiModel)[];
  static interfaceOptions?: {
    descriminator: string;
    models: string[];
  };
  static crudOptions: CrudOptions = {}
  static initialHooks: Partial<ModelHooks<KishiModel, Attributes<KishiModel>>> = {};
  static schemas: Record<string, string[]> = {};
  static initialAttributes: KishiModelAttributes = {};
  static initialAssociations: { [key: string]: typesOfKishiAssociationOptions } = {};
  static finalAssociations: { [key: string]: FinalAssociation } = {};
  static binders?: AttributeBinder[]

  static initialOptions: KishiModelOptions = {};
  files: Record<string, AbstractFile | AbstractFile[]> = {}
  static AfterView?: (row: KishiModel, view: any) => any;
  static PreInit?: (sequelize: Sequelize, models: Record<string, typeof KishiModel>) => any;
  static WhereFromDisplay?: (display: string) => WhereOptions;
  static get nonVirtualAttributes(): string[] {
    return Object.keys(this.rawAttributes).filter(name => (this.rawAttributes[name].type.constructor.name != "VIRTUAL"))
  }
  static get uniqueAttributes(): string[] {
    return Object.keys(this.rawAttributes).filter(name => (this.rawAttributes[name].unique == true) || name == "id")
  }
  static get models(): Record<string, typeof KishiModel> {
    return (this.sequelize?.models || {}) as Record<string, typeof KishiModel>
  }
  static GetDefaultCrud(key: keyof CrudOptions): CrudOption {
    const parentOptions = this.parentOptions
    if (!parentOptions) return true
    const { models, descriminator } = parentOptions
    return async (user?: IUser) => {
      {
        let whereList = []
        for (const modelName of models) {
          const Model = this.models[modelName]
          let crudOption = Model.crudOptions[key] || true
          let crudResponse
          if (typeof crudOption == "function") {
            crudResponse = await crudOption(user)
          } else {
            crudResponse = crudOption
          }
          if (typeof crudOption == "boolean") {
            if (crudResponse == true)
              whereList.push(this.FlattenWhere({ [descriminator]: modelName }))
          } else {
            whereList.push(this.FlattenWhere({ [modelName]: crudResponse }))
          }
          if (whereList.length == 0) return false
          if (whereList.length == 1) return whereList[0]
          return { [KOp("or")]: whereList }
        }
      }
    }
  }

  get modelName(): string {
    return this.constructor.name
  }
  get Model(): typeof KishiModel {
    return this.sequelize.models[this.constructor.name] as typeof KishiModel
  }
  get id(): any {
    return this.id
  }
  get display(): string | undefined {
    return undefined
  }

  comapre(key: string, value: any): boolean | undefined {
    const dataValue = this.getDataValue(key)
    if (dataValue === undefined) return undefined;
    let kishiType = (this.Model.rawAttributes[key].type as KishiDataType)
    if (kishiType?.compare) {
      return kishiType.compare(dataValue, value)
    }
    return this.get(key) == value
  }
  static ReversePath(path: string): string {
    let [associationName, restPath] = pathHead(path)
    const associations = this.finalAssociations;
    const association = associations[associationName];
    if (!association) {
      throw `${this.name}.${path} is not a valid path`
    }
    const otherAssociationName = association.otherAssociation?.as || ""
    if (restPath)
      return association.Target.ReversePath(restPath) + `.${otherAssociationName}`
    return otherAssociationName
  }
  static DataToWhere(data: any): WhereOptions | undefined {
    let where: WhereOptions | undefined = []
    for (const index of this.options.indexes || []) {
      let _where: any | null = {}
      if (!index.unique || !index.fields) continue
      for (const field of index.fields) {
        if (typeof field != "string" || !data[field]) {
          _where = null
          break
        }
        _where[field] = data[field]
      }
      if (_where)
        where.push(_where)
    }
    for (const attribute of this.uniqueAttributes) {
      if (data[attribute]) {
        where.push({ [attribute]: data[attribute] })
      }
    }
    if (where.length == 0)
      where = undefined
    else if (where.length == 1)
      where = where[0]
    else
      where = { [KOp("or")]: where }
    return where
  }
  static GenerateOtherAssociation(association: FinalAssociation, otherAssociationName: string) {
    const { Target, sourceKey, targetKey, foreignName } = association
    if (otherAssociationName in Target.finalAssociations) {
      throw `${this.name}.${association.as}:otherAssociationName(${otherAssociationName}) already exist in Target`
    }
    switch (association.type) {
      case "belongsTo":
        let hasMany: KishiHasMany = {
          type: "hasMany",
          as: otherAssociationName,
          actionMap: { Create: null, Update: null, Link: null },
          schemaMap: { "pure": null, "nested": null, "full": null },
          foreignName: foreignName,
          idName: otherAssociationName + "Id",
          sourceKey: targetKey,
          targetKey: sourceKey,
          Target: this,
          target: this.name,
          foreignKey: foreignName,
          otherAssociation: association,
          exclusiveAssociations: [],
        }
        Target.hasMany(this, hasMany)
        Target.finalAssociations[otherAssociationName] = hasMany
        association.otherAssociation = hasMany
        break;
      case "hasOne":
      case "hasMany":
        let belongsTo: KishiBelongsTo = {
          type: "belongsTo",
          as: otherAssociationName,
          actionMap: { Create: null, Update: null, Link: null },
          schemaMap: { "pure": null, "nested": null, "full": null },
          foreignName: foreignName,
          idName: otherAssociationName + "Id",
          sourceKey: targetKey,
          targetKey: sourceKey,
          Target: this,
          target: this.name,
          foreignKey: foreignName,
          otherAssociation: association,
          exclusiveAssociations: [],
        }
        Target.belongsTo(this, belongsTo)
        Target.finalAssociations[otherAssociationName] = belongsTo
        association.otherAssociation = belongsTo
        break;
      case "belongsToMany":
        const { Through, throughSourceKey, otherKey } = association
        let belongsToMany: KishiBelongsToMany = {
          type: "belongsToMany",
          as: otherAssociationName,
          actionMap: { Create: null, Update: null, Link: null },
          schemaMap: { "pure": null, "nested": null, "full": null },
          foreignName: foreignName,
          idName: otherAssociationName + "Id",
          sourceKey: targetKey,
          targetKey: sourceKey,
          Target: this,
          target: this.name,
          throughSourceKey: otherKey,
          otherKey: throughSourceKey,
          Through,
          through: Through.name as string,
          otherAssociation: association,
          exclusiveAssociations: [],
        }
        Target.belongsToMany(this, belongsToMany as any)
        Target.finalAssociations[otherAssociationName] = belongsToMany
        association.otherAssociation = belongsToMany
        break;
      default:
        break;
    }
  }

  static FlattenWhere(whereOptions: any | undefined, prefix = ""): any | undefined {
    if (!whereOptions) return whereOptions
    let where: any = {}
    if (Array.isArray(whereOptions)) {
      let whereArr = []
      for (const whereOptions_ of whereOptions) {
        whereArr.push(this.FlattenWhere(whereOptions_, prefix))
      }
      whereArr = KArray.clense(whereArr)
      return whereArr
    }
    for (const key in whereOptions) {
      const associationPrefix = prefix ? `${prefix}.${key}` : key
      if (key.startsWith("#")) {
        where[key] = this.FlattenWhere(whereOptions[key], prefix)
        if (Array.isArray(where[key]) && where[key].length == 0) {
          delete where[key]
        }
      } else if (key in this.rawAttributes) {
        where[`$${associationPrefix}$`] = whereOptions[key] as any
      } else if (key in this.finalAssociations) {
        const association = this.finalAssociations[key]
        let associationWhere = association.Target.FlattenWhere(whereOptions[key], associationPrefix)
        if (associationWhere) {
          where = { ...where, ...associationWhere }
        }
        if (association.type == "belongsToMany" && whereOptions[key]?.[association.Through.name]) {
          let throughWhere = association.Through.FlattenWhere(whereOptions[key][association.Through.name], `${associationPrefix}.${association.Through.name}`)
          if (throughWhere) {
            where = { ...where, ...throughWhere }
          }
        }
      }
    }
    for (const key in this.finalAssociations) {
      const association = this.finalAssociations[key]
      if (!isPI(association)) continue
      const associationPrefix = prefix ? `${prefix}.${key}` : key
      const associationWhere = association.Target.FlattenWhere(whereOptions, associationPrefix)
      if (associationWhere) {
        where = { ...where, ...associationWhere }
      }
    }
    where = Object.keys(where).length > 0 ? where : undefined
    return where
  }
  static WhereOptionsToPaths(whereOptions: any | undefined): string[] {
    let paths: string[] = []
    if (!whereOptions) return paths
    if (Array.isArray(whereOptions)) {
      whereOptions.forEach(where_ => {
        paths.push(...this.WhereOptionsToPaths(where_))
      });
      return [...new Set(paths)]
    }
    for (let key in whereOptions) {
      let value = whereOptions[key]
      if (key.startsWith("$") && key.endsWith("$"))
        key = key.slice(1, key.length - 1)
      if (key.startsWith("#")) {
        paths.push(...this.WhereOptionsToPaths(whereOptions[key]))
      } else if (key in this.rawAttributes) {
        paths.push(key)
      } else if (key.includes(".")) {
        let [head, rest, parts] = pathHead(key)
        if (head in this.finalAssociations) {
          let association = this.finalAssociations[head]
          let associationPaths: string[] = []
          if (association.type == 'belongsToMany' && parts[1] == association.Through.name) {
            associationPaths = association.Through.WhereOptionsToPaths({ [parts.slice(2).join(".")]: value })
            for (const path of associationPaths) {
              paths.push(`${head}.${association.Through.name}.${path}`)
            }
          } else {
            associationPaths = association.Target.WhereOptionsToPaths({ [rest]: value })
            for (const path of associationPaths) {
              paths.push(`${head}.${path}`)
            }
          }
        }
      } else {
        console.warn(`${this.name}.WhereOptionsToPaths unknow key:${key}`);
      }
    }
    return [...new Set(paths)]
  }
  static WhereOptionsToFindOptions(whereOptions: any | undefined): FindOptions {
    const paths = this.WhereOptionsToPaths(whereOptions)
    const findOptions = this.PathsToFindOptions(paths)
    return findOptions
  }
  static async CallHooks(hookName: string, ...args: any[]) {
    const hooks = (this as any).options?.hooks[hookName]
    for (const hook of hooks || []) {
      const options = args[1] || args[0]
      if (options.hooks == false)
        break
      if ("fn" in hook && typeof hook.fn == 'function') {
        await hook.fn(...args)
      }
      else if (typeof hook == 'function')
        await hook(...args)
      else
        console.error(hook);
    }
  }

  static addAttribute(key: string, value: KishiDataType | KishiModelAttributeColumnOptions): void {
    if (this.options) throw `${this.name} has already been initialized`;
    this.initialAttributes[key] = value;
  }
  static addAssociation(key: string, options: typesOfKishiAssociationOptions): void {
    this.initialAssociations[key] = options;
  }
  static addIndex(index: IndexesOptions): void {
    if (this.options) {
      const existing = this.options.indexes?.find((index_) => index_.name == index.name)
      if (!existing)
        (this.options.indexes as IndexesOptions[]).push(index)
    } else {
      this.initialOptions.indexes = this.initialOptions.indexes || [];
      const existing = this.initialOptions.indexes?.find((index_) => index_.name == index.name)
      if (!existing)
        (this.initialOptions.indexes as IndexesOptions[]).push(index)
    }
  }

  static Init(sequelize: Sequelize, models: Record<string, typeof KishiModel>): void {
    this.PreInit?.(sequelize, models)
    console.log(`${this.name}.Init`);
    defaults(this.crudOptions, {
      "create": true,
      "read": this.GetDefaultCrud("read"),
      "update": this.GetDefaultCrud("update"),
      "delete": this.GetDefaultCrud("delete"),
    })
    this.finalAssociations = {}
    const childModels = Array.from(Object.values(models).filter(model => model.ParentModel == this), model => model.name)
    if (childModels.length > 0) {
      this.parentOptions = {
        descriminator: this.name + "Type",
        models: childModels,
      }
      console.log(`${this.name}.parentOptions`, this.parentOptions);
    }

    const realizerModels = Array.from(Object.values(models).filter(model => model.InterfaceModels?.includes(this)), model => model.name)
    if (realizerModels.length > 0) {
      this.interfaceOptions = {
        descriminator: this.name + "Type",
        models: realizerModels,
      }
      console.log(`${this.name}.interfaceOptions`, this.interfaceOptions);
    }
    if (this.parentOptions) {
      const { descriminator, models, allowNull = true } = this.parentOptions
      this.initialAttributes[descriminator] = {
        type: KishiDataTypes.ENUM(...models),
        allowNull,
      }
    }
    if (this.interfaceOptions) {
      const { descriminator, models } = this.interfaceOptions
      this.initialAttributes[descriminator] = {
        type: KishiDataTypes.ENUM(...models),
        allowNull: false,
      }
    }
    for (const attributeName in this.initialAttributes) {
      let attribute = this.initialAttributes[attributeName];
      if (!(attribute as KishiModelAttributeColumnOptions)?.type) {
        attribute = {
          type: attribute
        } as KishiModelAttributeColumnOptions
      }
      attribute = attribute as KishiModelAttributeColumnOptions
      initDataType(this, attributeName, attribute)
      this.initialAttributes[attributeName] = attribute;
      (attribute.type as KishiDataType)?.Init?.(this, attribute);
    }
    this.init(this.initialAttributes, {
      sequelize,
      ...this.initialOptions,
    });
    (this as any)._findAll = this.findAll.bind(this);
    async function findAll(this: typeof KishiModel, options?: FindOptions | undefined): Promise<KishiModel[] | KishiModel | null> {
      options = options || {}
      let _options: FindOptions = cloneDeep(options || {})
      const { where } = _options
      let wherePaths = this.WhereOptionsToPaths(where)
      let findPaths = this.FindOptionsToPaths(options)
      let diffPaths = KArray.minus(wherePaths, this.PathsExplicit(findPaths))
      const { attributes, include } = this.PathsToFindOptions(wherePaths)
      if (include || diffPaths.length > 0) {
        // console.log("findAll");
        // console.log({ where, include, wherePaths, diffPaths });
        delete _options.limit
        delete _options.offset
        delete _options.group
        delete _options.plain
        _options.attributes = attributes
        _options.include = include
        const _rows = await (this as any)._findAll(_options) as KishiModel[]
        const ids = KArray.get(_rows, "id")
        if (ids.length == 0) {
          console.log("Skip where", _rows);
          return (options.plain ? null : [])
        }
        if (options.offset && options.offset >= ids.length) {
          console.log(`Skip offset ${options.offset}>=${ids.length}`);
          return (options.plain ? null : [])
        }
        _options.include = options.include
        _options.attributes = options.attributes
        _options.limit = options.limit
        _options.group = options.group
        _options.offset = options.offset
        _options.plain = options.plain
        _options.where = ids.length == 1 ? { id: ids[0] } : { id: { [KOp("in")]: ids } }
      }
      return await (this as any)._findAll(_options) as KishiModel[] | KishiModel | null
    }
    (this as any).findAll = findAll.bind(this);
    (this as any)._count = this.count.bind(this);
    async function count(this: typeof KishiModel, options?: CountOptions | undefined): Promise<any> {
      options = options || {}
      if (options.distinct === undefined)
        options.distinct = true
      let _options: FindOptions = cloneDeep(options || {})
      delete _options.include
      delete _options.attributes
      delete _options.group
      const { where } = _options
      if (where) {
        // const paths = this.WhereOptionsToPaths(where)
        // console.log("count where", paths);
        const { attributes, include } = this.WhereOptionsToFindOptions(where)
        _options.attributes = attributes
        _options.include = include
      }
      return await (this as any)._count(_options)
    }
    (this as any).count = count.bind(this);

    (this as any)._findAndCountAll = this.findAndCountAll.bind(this);
    async function findAndCountAll(this: typeof KishiModel, options?: FindAndCountOptions | undefined): Promise<{ rows: KishiModel[], count: number }> {
      options = options || {}
      let _options: FindOptions = cloneDeep(options || {})
      const { where } = _options
      let wherePaths = this.WhereOptionsToPaths(where)
      let findPaths = this.FindOptionsToPaths(options)
      let diffPaths = KArray.minus(wherePaths, findPaths)
      const { attributes, include } = this.PathsToFindOptions(wherePaths)
      if (include || diffPaths.length > 0) {
        let rows: KishiModel[] = [] as KishiModel[]
        let count: number
        // console.log({ where, include, wherePaths, diffPaths });
        delete _options.limit
        delete _options.offset
        delete _options.group
        _options.attributes = attributes
        _options.include = include
        const _rows = await (this as any)._findAll(_options) as KishiModel[]
        const ids = KArray.get(_rows, "id")
        count = ids.length
        if (ids.length == 0) {
          console.log("Skip where", _rows);
          return { rows: [], count }
        }
        if (options.offset && options.offset >= count) {
          console.log(`Skip offset ${options.offset}>=${ids.length}`);
          return { rows: [], count }
        }
        _options.include = options.include
        _options.attributes = options.attributes
        _options.limit = options.limit
        _options.group = options.group
        _options.offset = options.offset
        _options.where = ids.length == 1 ? { id: ids[0] } : { id: { [KOp("in")]: ids } }
        rows = await (this as any)._findAll(_options) as KishiModel[]
        return { rows, count }
      }
      return await (this as any)._findAndCountAll(_options) as { rows: KishiModel[], count: number }
    }
    (this as any).findAndCountAll = findAndCountAll.bind(this);
    // this.beforeFind((options) => {
    //   console.log("beforeFind");
    // })
    // this.beforeFindAfterExpandIncludeAll((options) => {
    //   console.log("beforeFindAfterExpandIncludeAll");
    // })
    // this.beforeFindAfterOptions((options) => {
    //   console.log("beforeFindAfterOptions");
    // })
    for (const attributeName in this.rawAttributes) {
      let kishiOptions = this.initialAttributes[attributeName] as KishiModelAttributeColumnOptions;
      let type = kishiOptions?.type as KishiDataType;
      type?.Hook?.(this)
    }
    for (const hookName in this.initialHooks) {
      let name = hookName as keyof Partial<ModelHooks<KishiModel, Attributes<KishiModel>>>;
      let hook = this.initialHooks[name];
      this.addHook(name, hook as any);
    }
  }
  public static Associate() {
    if (this.interfaceOptions) {
      const { models } = this.interfaceOptions
      let interfaceAssociations = []
      for (const modelName of models) {
        const Target = this.models[modelName]
        //realizer has one interface
        let hasOne: KishiHasOne = {
          type: "hasOne",
          as: this.name,
          actionMap: { Create: "Create", Update: "Update", Link: null },
          schemaMap: { "pure": "pure", "nested": "nested", "full": "full" },
          foreignName: "id",
          idName: this.name + "Id",
          sourceKey: "id",
          targetKey: "id",
          Target: this,
          target: this.name,
          foreignKeyConstraint: false,
          foreignKey: {
            name: "id",
            allowNull: true,
          },
          exclusiveAssociations: [],
        }
        //interface belongsTo realizer
        let belongsTo: KishiBelongsTo = {
          type: "belongsTo",
          as: Target.name,
          actionMap: { Create: null, Update: "Update", Link: null },
          schemaMap: { "pure": null, "nested": null, "full": null },
          foreignName: "id",
          idName: Target.name + "Id",
          sourceKey: "id",
          targetKey: "id",
          onDelete: "CASCADE",
          Target: Target,
          target: Target.name,
          realizer: true,
          foreignKeyConstraint: false,
          foreignKey: {
            name: "id",
            allowNull: true,
          },
          otherAssociation: hasOne,
          exclusiveAssociations: [],
        }
        hasOne.otherAssociation = belongsTo
        Target.hasOne(this, hasOne)
        Target.finalAssociations[this.name] = hasOne
        this.belongsTo(Target, belongsTo)
        this.finalAssociations[Target.name] = belongsTo
        interfaceAssociations.push(belongsTo)
      }
      for (const modelName of models) {
        const Target = this.models[modelName]
        this.finalAssociations[Target.name].exclusiveAssociations = interfaceAssociations.filter(association => association.as != Target.name)
        console.log(`${this.name}.${Target.name}.exclusiveAssociations:`, this.finalAssociations[Target.name].exclusiveAssociations.map(association => association.as))
      }
      delete this.rawAttributes["id"].references
      delete this.rawAttributes["id"].onDelete
      delete this.rawAttributes["id"].onUpdate
    }
    if (this.parentOptions) {
      const { models } = this.parentOptions
      let parentAssociations = []
      for (const modelName of models) {
        const Target = this.models[modelName]
        let hasOne: KishiHasOne = {
          type: "hasOne",
          as: modelName,
          actionMap: { Create: "Create", Update: "Update", Link: null },
          schemaMap: { "pure": null, "nested": null, "full": null },
          foreignName: "id",
          idName: modelName + "Id",
          sourceKey: "id",
          targetKey: "id",
          Target,
          target: modelName,
          foreignKey: {
            name: "id",
            allowNull: false,
          },
          exclusiveAssociations: [],
        }
        this.hasOne(Target, hasOne)
        this.finalAssociations[modelName] = hasOne
        parentAssociations.push(hasOne)
        let belongsTo: KishiBelongsTo = {
          type: "belongsTo",
          as: this.name,
          actionMap: { Create: "Create", Update: "Update", Link: null },
          schemaMap: { "pure": "pure", "nested": "nested", "full": "full" },
          foreignName: "id",
          idName: "id",
          sourceKey: "id",
          targetKey: "id",
          onDelete: "CASCADE",
          Target: this,
          target: this.name,
          parent: true,
          foreignKey: {
            name: "id",
            allowNull: false,
          },
          otherAssociation: hasOne,
          exclusiveAssociations: [],
        }
        hasOne.otherAssociation = belongsTo
        Target.belongsTo(this, belongsTo)
        Target.finalAssociations[this.name] = belongsTo
      }
      for (const modelName of models) {
        const Target = this.models[modelName]
        this.finalAssociations[Target.name].exclusiveAssociations = parentAssociations.filter(association => association.as != Target.name)
        console.log(`${this.name}.${Target.name}.exclusiveAssociations:`, this.finalAssociations[Target.name].exclusiveAssociations.map(association => association.as))
      }
    }
    for (const name in this.initialAssociations) {
      let options = this.initialAssociations[name] as KishiBelongsToOptions | KishiBelongsToManyOptions | KishiHasManyOptions | KishiHasOneOptions;
      options.as = name;
      const Target = this.sequelize?.models[options.target] as typeof KishiModel;

      if (!Target) throw { error: "Unvalid Target Model", options };
      options.actionMap = options.actionMap || {}
      options.schemaMap = options.schemaMap || {}
      options.foreignName = (options.foreignKey as ForeignKeyOptions)?.name || (options.foreignKey as string);
      let final: FinalAssociation | null = null
      switch (options.type) {
        case "belongsTo":
          options.idName = options.foreignName
          defaults(options, {
          })
          defaults(options.actionMap, { Create: "Set", Update: null, Link: "Set" });
          defaults(options.schemaMap, { full: "pure", nested: "id" });
          options.schemaMap.pure = options.parent ? "pure" : null
          this.belongsTo(Target, options);
          final = options as KishiBelongsTo
          final.sourceKey = options.foreignName
          final.targetKey = "id"
          break;
        case "hasOne":
          options.idName = options.idName || options.as + "Id"
          defaults(options.actionMap, { Create: "Create", Update: "Update", Link: "Set" });
          defaults(options.schemaMap, { full: "pure", nested: "pure" });
          this.hasOne(Target, options);
          final = options as KishiHasOne
          final.sourceKey = "id"
          final.targetKey = options.foreignName
          break;
        case "hasMany":
          options.idName = options.idName || options.as + "Id"
          defaults(options.actionMap, { Create: "Create", Update: "Update", Link: "Set" });
          defaults(options.schemaMap, { full: null, nested: null });
          this.hasMany(Target, options);
          final = options as KishiHasMany
          final.sourceKey = "id"
          final.targetKey = options.foreignName
          break;
        case "belongsToMany":
          options.idName = options.idName || options.as + "Id"
          defaults(options.actionMap, { Create: "Set", Update: "Set", Link: "Set" });
          defaults(options.schemaMap, { full: null, nested: null });
          options.Through = this.sequelize?.models[options.through] as typeof KishiModel;
          if (!options.Through) throw { error: "Unvalid Through Model", options };
          options.uniqueKey = options.Through.name
          const association = this.belongsToMany(Target, options as KishiBelongsToManyOptions);
          const { otherKey, foreignKey } = association
          const index: IndexesOptions = {
            name: options.Through.name + "_unique",
            unique: true,
            fields: [otherKey, foreignKey]
          }
          options.Through.addIndex(index)
          final = {
            ...options,
            throughSourceKey: foreignKey,
            otherKey: otherKey,
          } as KishiBelongsToMany
          final.sourceKey = "id"
          final.targetKey = "id"
          break;
        default:
          throw { error: "Unvalid Options", options };
      }
      if (!final) {
        console.warn(name);
        continue
      }
      final.Target = Target
      final.exclusiveAssociations = []
      this.finalAssociations[name] = final;
    }
  }
  static async LoadOptionsRows(options: UpdateOptions, attributes = ["id"]) {
    var { where } = options
    let rows = (options as any).rows as KishiModel[]
    if (!rows) {
      attributes = [...new Set([...attributes, "id"])];
      rows = await this.findAll({ attributes, where })
      const ids = KArray.get(rows, "id")
      options.where = ids.length > 0 ? { id: { [KOp("in")]: ids } } : { id: null }
      if (ids.length == 0) {
        // options.hooks = false
        console.warn(`${this.name} hooks ignored`);
      }
      (options as any).rows = rows
      return rows
    }
    if (rows && rows[0]) {
      const currentAtts = Object.keys((rows[0] as any).dataValues)
      let missingAtts = []
      for (const att of attributes) {
        if (!currentAtts.includes(att))
          missingAtts.push(att)
      }
      if (missingAtts.length > 0) {
        const missingRows = await this.findAll({ attributes: ["id", ...missingAtts], where })
        if (missingRows.length != rows.length) {
          const err = new Error(`${this.name}.LoadOptionsRows, missingRows Length not matched (${missingRows.length} != ${rows.length})`)
          console.error(err);
          console.error(where);
        }
        for (var row of rows) {
          const matched = missingRows.find(missing => missing.id == row.id)
          if (!matched) {
            console.error(row.id);
            continue
          }
          for (const att of missingAtts) {
            row.setDataValue(att, matched.getDataValue(att))
          }
        }
      }
    }
    (options as any).rows = rows
    return rows
  }
  public static PostAssociate() {
    const OnDeleteForeignKeys = Object.keys(this.rawAttributes).filter(name =>
      this.rawAttributes[name].references && ["cascade", "no action", "set null"].includes(this.rawAttributes[name]?.onDelete?.toLowerCase() || "")
    )
    for (const sourceKey of OnDeleteForeignKeys) {
      const { references, onDelete = "", allowNull = true } = this.rawAttributes[sourceKey]
      const key = this.name + "." + sourceKey
      let Target: typeof KishiModel
      if (typeof references == "string") {
        Target = this.models[references] as typeof KishiModel

      } else if (typeof (references?.model) == "string") {
        Target = this.models[references.model] as typeof KishiModel
      } else if (references?.model) {
        Target = this.models[references.model.name || ""] as typeof KishiModel
      }
      else {
        console.error(key, { references, onDelete, allowNull });
        continue
      }
      // console.log(key, { references, onDelete, allowNull });
      // console.log(Target);
      let type = onDelete.toLowerCase()
      //destroy
      Target.beforeDestroy(key + "_beforeDestroy", async (row, options) => {
        var keyOptions = {
          transaction: options.transaction,
          where: { [sourceKey]: row.id },
        } as UpdateOptions & { attributes: any }
        if (type == "set null") {
          keyOptions.fields = [sourceKey]
          keyOptions.attributes = { [sourceKey]: null }
        }
        await this.CallHooks(type == "cascade" ? "beforeBulkDestroy" : "beforeBulkUpdate", keyOptions);
        (options as any)[key] = keyOptions

        console.log(key, keyOptions);
        console.log(key + "_beforeDestroy done");
      })
      Target.afterDestroy(key + "_afterDestroy", async (row, options) => {
        let keyOptions = (options as any)[key] as UpdateOptions & { attributes: any }
        if (!keyOptions) {
          console.log(key + "_afterDestroy");
          console.log(new Error().stack);
        }
        console.log(key, keyOptions);
        if (keyOptions.hooks == false)
          return
        await this.CallHooks(type == "cascade" ? "afterBulkDestroy" : "afterBulkUpdate", keyOptions);
        console.log(key + "_afterDestroy done");

      })
      //bulk destroy
      Target.beforeBulkDestroy(key + "_beforeBulkDestroy", async (options) => {
        //update options
        let { } = options
        const rows = await Target.LoadOptionsRows(options as UpdateOptions)
        if (rows.length == 0)
          return
        var keyOptions = {
          transaction: options.transaction,
          where: { [sourceKey]: { [KOp("in")]: KArray.get(rows, "id") } },
        } as UpdateOptions & { attributes: any }
        if (type == "set null") {
          keyOptions.fields = [sourceKey]
          keyOptions.attributes = { [sourceKey]: null }
        }
        await this.CallHooks(type == "cascade" ? "beforeBulkDestroy" : "beforeBulkUpdate", keyOptions);
        (options as any)[key] = keyOptions
        console.log(key + "_beforeBulkDestroy done");

      })
      Target.afterBulkDestroy(key + "_afterBulkDestroy", async (options) => {
        let keyOptions = (options as any)[key] as UpdateOptions & { attributes: any }
        let rows = (options as any).rows as KishiModel[]
        if (!keyOptions) {
          console.log(key + "_afterDestroy");
          console.log(new Error().stack);
        }
        if (rows && rows.length == 0)
          return
        await this.CallHooks(type == "cascade" ? "afterBulkDestroy" : "afterBulkUpdate", keyOptions);
        console.log(key + "_afterBulkDestroy done");
      })
    }
    for (const name in this.finalAssociations) {
      let association = this.finalAssociations[name];
      if (association.otherAssociation)
        continue
      const Target = association.Target;
      switch (association.type) {
        case "belongsTo":
          association.otherAssociation = Object.values(Target.finalAssociations).find((_association) => {
            if (_association.type != "hasOne" && _association.type != "hasMany") return false;
            return _association.Target == this && _association.foreignName == association.foreignName;
          }) as KishiHasMany | KishiHasOne | undefined;
          break;
        case "hasMany":
        case "hasOne":
          association.otherAssociation = Object.values(Target.finalAssociations).find((_association) => {
            if (_association.type != "belongsTo") return false;
            return _association.Target == this && _association.foreignName == association.foreignName;
          }) as KishiBelongsTo | undefined;
          break;
        case "belongsToMany":
          association.otherAssociation = (Object.values(Target.finalAssociations)).find((other) => {
            let me = association as KishiBelongsToMany
            if (other.type != "belongsToMany") return false;
            return other.Target == this && other.Through.name == me.Through.name
              && me.throughSourceKey == other.otherKey && me.otherKey == other.throughSourceKey
          }) as KishiBelongsToMany | undefined;
          break;
        default:
          throw { error: "Unvalid association", association };
      }
      if (!association.otherAssociation) {
        this.GenerateOtherAssociation(association, `${this.name}_as_${association.as}`)
        console.warn(`${association.Target.name}.${this.name}_as_${association.as} generated from ${this.name}.${association.as}`);
      }
    }
  }

  public static Loop(cb: (Model: typeof KishiModel, association: KishiAssociation | null, buffer: any) => void, buffer: any = {}, stack: string[] = []): any {
    cb(this, null, buffer)
    const associations = this.finalAssociations;
    for (const associationName in associations) {
      const association = associations[associationName];
      const track = this.ValidateStack(association, stack);
      if (!track) continue;
      stack.push(track);
      cb(association.Target, association, buffer)
      stack.pop()
    }
    return buffer
  }

  static ValidateStack(association: KishiAssociation, stack: string[]): string | null {
    const { exclusiveAssociations } = association
    const me = this.name + "." + association.as;
    if (stack.includes(me)) {
      return null;
    }
    for (const exclusiveAssociation of [association, ...exclusiveAssociations]) {
      const opposite = `${exclusiveAssociation.Target.name}.${exclusiveAssociation.otherAssociation?.as}`
      if (stack.includes(opposite)) {
        return null;
      }
    }
    return me;
  }
  static SchemaToPaths(schema: string | null, toView = false, stack: string[] = []): string[] {
    let paths: string[] = [];
    if (!schema) return paths
    const attribtues = this.getAttributes();
    switch (schema) {
      case "id":
        return ["id"];
      case "full":
      case "nested":
      case "pure":
        paths = Object.keys(attribtues);
        if (toView)
          paths = paths.filter((attributeName) => {
            const attribute = attribtues[attributeName] as KishiModelAttributeColumnOptions;
            return attribute.toView != false;
          });
        // if (schema == "pure") return paths;
      default:
        break;
    }
    if (schema in this.schemas) paths = this.schemas[schema];
    const associations = this.finalAssociations;
    for (const associationName in associations) {
      const association = associations[associationName];
      if (toView && association.toView == false) continue;
      if (!(schema in association.schemaMap)) continue;
      const track = this.ValidateStack(association, stack);
      if (!track) continue;
      stack.push(track);
      let associationPaths = association.Target.SchemaToPaths(association.schemaMap[schema], toView, stack);
      for (const path of associationPaths) {
        paths.push(`${associationName}.${path}`);
      }
      if (association.type == "belongsToMany") {
        const { Through } = association
        let throughPaths = Through.SchemaToPaths(association.schemaMap[schema], toView, stack);
        for (const path of throughPaths) {
          paths.push(`${associationName}.${Through.name}.${path}`);
        }
      }
      stack.pop()
    }
    return paths;
  }
  static FindOptionsToPaths(options: FindOptions): string[] {
    let attributes = options.attributes as string[]
    let include = options.include as IncludeOptions[]
    include = (Array.isArray(include) ? include : (include ? [include] : [])) as IncludeOptions[]
    let paths: string[] = []
    if (!attributes) paths = ["*"]
    else
      paths = KArray.intersection(this.nonVirtualAttributes, attributes)
    for (const _include of include) {
      const { as } = _include
      const association = this.finalAssociations[as || ""]
      const model = (_include.model || (_include.association as Association<KishiModel, KishiModel>).target) as typeof KishiModel
      const includePaths = model.FindOptionsToPaths(_include)
      if (!includePaths.includes("id"))
        includePaths.push("id")
      if (association.type == "belongsToMany") {
        includePaths.push(`${association.Through.name}.*`)
      }
      for (const path of includePaths)
        paths.push(`${as}.${path}`)
    }
    return paths
  }

  static IsPathsMany(paths: string[] = []): boolean {
    const associations = this.finalAssociations;
    for (const associationName in associations) {
      const association = associations[associationName];
      let associationPaths = paths.filter((path) => path.startsWith(associationName));
      if (associationPaths.length == 0) continue;
      if (association.type == "hasMany" || association.type == "belongsToMany")
        return true
      associationPaths = Array.from(associationPaths, (path) => pathHead(path)[1]);
      if (association.Target.IsPathsMany(associationPaths))
        return true
    }
    return false
  }
  static FindOptionsToDependencies(options: FindOptions) {
    const dependencies = [this.name]
    let include = options.include as IncludeOptions[]
    include = (Array.isArray(include) ? include : (include ? [include] : [])) as IncludeOptions[]
    for (const item of include) {
      let model: typeof KishiModel
      model = (item.model || (item.association as Association)?.target) as typeof KishiModel
      try {
        dependencies.push(...this.FindOptionsToDependencies(item))
      } catch (error) {
        console.error(this.name);
        console.error(item);
        throw error
      }
      const { as } = item
      const association = as ? this.finalAssociations[as] : null
      if (association?.type == "belongsToMany")
        dependencies.push(association.Through.name)
    }
    return [...new Set(dependencies)]
  }
  static PathsToDependencies(paths: string[]): string[] {
    let dependencies: string[] = [this.name]
    const associations = this.finalAssociations;
    for (const associationName in associations) {
      const association = associations[associationName];
      let associationPaths = paths.filter((path) => path.startsWith(associationName));
      if (associationPaths.length == 0) continue;
      associationPaths = Array.from(associationPaths, (path) => pathHead(path)[1]);
      dependencies.push(...association.Target.PathsToDependencies(associationPaths))
      if (association.type == "belongsToMany")
        dependencies.push(association.Through.name)
    }
    return [...new Set(dependencies)]
  }
  static PathSplit(path: string): SplitAssociationPoint[] {
    let splits: SplitAssociationPoint[] = [{ model: this, pathToSource: "", pathToTarget: path }]
    let [key, restPath] = pathHead(path)
    const associations = this.finalAssociations;
    if (!(key in associations)) {
      return splits
    }
    const association = associations[key];
    let associationSplits = association.Target.PathSplit(restPath)
    const otherAssociationName = association.otherAssociation?.as || ""
    for (let split of associationSplits) {
      split.pathToSource = pathConcat(split.pathToSource, otherAssociationName)
      splits.push(split)
    }
    return splits
  }
  static PathsExplicit(paths: string[]): string[] {
    let implicit = paths.filter(path => path.includes("*"))
    let explicit = paths.filter(path => !path.includes("*"))
    if (implicit.includes("*"))
      explicit.push(...this.nonVirtualAttributes)
    const associations = this.finalAssociations;
    for (const associationName in associations) {
      const association = associations[associationName];
      let associationImplicit = implicit.filter((path) => path.startsWith(associationName));
      if (associationImplicit.length == 0) continue;
      associationImplicit = Array.from(associationImplicit, (path) => path.split(".").slice(1).join("."));
      const associationExplicit = association.Target.PathsExplicit(associationImplicit)
      for (const path of associationExplicit) {
        explicit.push(`${associationName}.${path}`)
      }
      if (association.type == "belongsToMany") {
        const { Through } = association
        let throughImplicit = Array.from(associationImplicit.filter((path) => path.startsWith(`${Through.name}`)))
        throughImplicit = Array.from(throughImplicit, (path) => path.split(".").slice(1).join("."));
        const throughExplicit = Through.PathsExplicit(associationImplicit)
        for (const path of throughExplicit) {
          explicit.push(`${associationName}.${Through.name}.${path}`)
        }
      }
    }
    return explicit
  }

  static PathsToFindOptions(paths: string[] = [], stack: string[] = []): FindOptions {
    let options: FindOptions = {
      attributes: ["id"],
      include: [],
    };
    options.attributes = ["id"];
    const attribtues = this.getAttributes()
    for (const path of paths) {
      if (path == "*") {
        options.attributes = undefined
        break;
      }
      if (path in attribtues && !(options.attributes as string[])?.includes(path)) {
        (options.attributes as string[])?.push(path);
      }
    }
    const associations = this.finalAssociations;
    for (const associationName in associations) {
      const association = associations[associationName];
      let associationPaths = paths.filter((path) => path.startsWith(associationName));
      if (associationPaths.length == 0) continue;
      const track = this.ValidateStack(association, stack);
      if (!track) continue;
      stack.push(track);
      const Target = association.Target as typeof KishiModel;
      associationPaths = Array.from(associationPaths, (path) => path.split(".").slice(1).join("."));
      let associationOptions: IncludeOptions = {
        model: Target,
        as: association.as,
        where: association.where,
        on: association.on,
        ...(Target.PathsToFindOptions(associationPaths, stack) as IncludeOptions),
      };
      if (association.type == "belongsToMany") {
        const { Through } = association
        let throughPaths = Array.from(associationPaths.filter((path) => path.startsWith(`${association.Through.name}`)),
          (path) => path.split(".").slice(1).join("."))
        if (throughPaths.length > 0)
          associationOptions.through = Through.PathsToFindOptions(throughPaths, stack)
      }
      (options.include as IncludeOptions[])?.push(associationOptions);
      stack.pop();
    }
    if ((options.include as IncludeOptions[]).length == 0) delete options.include;
    if (options.attributes?.length == Object.keys(attribtues).length) delete options.attributes;
    return options;
  }
  static SchemaToFindOptions(schema: string, toView = false): FindOptions {
    const paths = this.SchemaToPaths(schema, toView);
    return this.PathsToFindOptions(paths);
  }
  async LoadAssociation(associationName: string, where?: WhereOptions): Promise<KishiModel | KishiModel[] | null> {
    if ((this as any)[associationName] != undefined) {
      return this
    }
    const paths = [`${associationName}.*`]
    let findOptions = this.Model.PathsToFindOptions(paths)
    if (where) {
      //TODO
      // findOptions.where = where
    }
    const _this = await this.Model.findByPk((this as any)["id"], findOptions)
    if (_this)
      return (_this as any)[associationName]
    return null
  }
  async Load(paths: string[] = [], stack: string[] = []): Promise<this> {
    return this
  }
  static get interfaceName(): string {
    return "I" + this.name
  }

  toView(stack: string[] = []): any {
    return this.Model.toView(this, stack)
  }
  static toView(rows: null | KishiModel | KishiModel[], stack: string[] = []): any | any[] | null {
    if (!rows) return rows;
    let _rows: KishiModel[] = Array.isArray(rows) ? rows : [rows];
    let views: any[] = [];
    const attribtues = this.getAttributes();
    for (const row of _rows) {
      let view: { [key: string]: any } = {};
      if (row.display)
        view.display = row.display
      for (const attributeName in attribtues) {
        const attribute = attribtues[attributeName] as KishiModelAttributeColumnOptions;
        if (!attribute) continue;
        if (attribute.type.constructor.name != "VIRTUAL") {
          if (!(attributeName in (row as any)?.dataValues)) continue;
        }
        const { toView } = attribute;
        if (toView == false) continue;
        view[attributeName] = (row as any)[attributeName];
        if (typeof toView == "function") {
          view[attributeName] = toView(view[attributeName]);
        }
      }
      const associations = this.finalAssociations;

      for (const associationName in associations) {
        const association = associations[associationName];
        if (!association) continue;
        if (association.toView == false) continue;
        const associated = (row as any)[associationName] as KishiModel | KishiModel[];
        if (associated === undefined) continue;
        const track = this.ValidateStack(association, stack);
        if (!track) continue;
        stack.push(track);
        var associatedView = association.Target.toView(associated, stack);
        if (association.type == "belongsToMany") {
          const _associated = associated as KishiModel[]
          const { Through } = association;
          for (const idx of _associated.keys()) {
            associatedView[idx][Through.name] = Through.toView(_associated[idx].get(Through.name) as KishiModel, stack);
          }
        }
        if (isPCIR(association))
          view = { ...view, ...associatedView }
        else
          view[associationName] = associatedView;
        stack.pop();
      }
      if (this.AfterView) view = this.AfterView(row, view);
      views.push(view);
    }
    return Array.isArray(rows) ? views : views[0];
  }
  static toData(rows: null | KishiModel | KishiModel[], stack: string[] = []): any | any[] | null {
    if (!rows) return rows;
    let _rows: KishiModel[] = Array.isArray(rows) ? rows : [rows];
    let datas: any[] = [];
    const attribtues = this.getAttributes();
    for (const row of _rows) {
      let data: { [key: string]: any } = {};
      for (const attributeName in attribtues) {
        const attribute = attribtues[attributeName] as KishiModelAttributeColumnOptions;
        if (!attribute) continue;
        if (attribute.type.constructor.name != "VIRTUAL") {
          if (!(attributeName in (row as any)?.dataValues)) continue;
        }
        data[attributeName] = (row as any)[attributeName];
      }
      const associations = this.finalAssociations;

      for (const associationName in associations) {
        const association = associations[associationName];
        if (!association) continue;
        const track = this.ValidateStack(association, stack);
        if (!track) continue;
        stack.push(track);
        const associated = (row as any)[associationName] as KishiModel | KishiModel[];
        if (associated === undefined) continue;
        var associatedView = association.Target.toData(associated, stack);
        if (association.type == "belongsToMany") {
          const _associated = associated as KishiModel[]
          const { Through } = association;
          for (const idx of _associated.keys()) {
            associatedView[idx][Through.name] = Through.toData(_associated[idx].get(Through.name) as KishiModel, stack);
          }
        }
        data[associationName] = associatedView;
        stack.pop();
      }
      datas.push(data);
    }
    return Array.isArray(rows) ? datas : datas[0];
  }
  static fromView(views: null | any | any[], stack: string[] = []): any | any[] | null {
    if (!views) return views;
    let _views: any[] = Array.isArray(views) ? views : [views];
    let datas: any[] = [];
    const attribtues = this.getAttributes();
    for (const view of _views) {
      let data: { [key: string]: any } = {};
      for (const attributeName in attribtues) {
        const attribute = attribtues[attributeName] as KishiModelAttributeColumnOptions;
        if (!attribute) continue;
        if (attribute.fromView == false) continue
        data[attributeName] = view[attributeName];
        if (typeof attribute.fromView == "function") {
          data[attributeName] = attribute.fromView(data[attributeName])
        }
      }
      const associations = this.finalAssociations;
      for (const associationName in associations) {
        const association = associations[associationName];
        if (!association) continue;
        let associatedView = view[associationName] as any | any[];
        data[association.idName] = view[association.idName]
        if (isPCIR(association))
          associatedView = view as any
        if (associatedView === undefined) continue;
        const track = this.ValidateStack(association, stack);
        if (!track) continue;
        stack.push(track);
        var associatedData = association.Target.fromView(associatedView, stack);
        if (!associatedData) {
          stack.pop();
          continue
        }
        if (association.type == "belongsToMany") {
          const _associatedView = associatedView as any[]
          const { Through } = association;
          for (const idx of _associatedView.keys()) {
            associatedData[idx][Through.name] = Through.fromView(_associatedView[idx][Through.name], stack)
          }
        }
        data[associationName] = associatedData
        stack.pop();
      }
      datas.push(data);
    }
    return Array.isArray(views) ? datas : datas[0];
  }

  public async LinkAssociation(name: string, values: any | any[], options?: InstanceUpdateOptions | undefined): Promise<this> {
    console.log(`${this.Model.name}[${this.id}].LinkAssociation(${name})`);
    console.log(values);

    const association = this.Model.finalAssociations[name]
    if (!association) throw `Unvalid Association ${this.Model.name}.${name}`
    let _values: any[] = Array.isArray(values) ? values : [values]
    _values = KArray.clense(_values);
    let data = KArray.toRecords(_values, "id");
    let ids = KArray.get(data, "id");
    switch (association.type) {
      case "belongsTo":
        this.set(association.sourceKey, ids)
        await this.save()
        return this
      case "hasOne":
      case "hasMany":
        await association.Target.update({ [association.targetKey]: this.get(association.sourceKey) }, {
          transaction: options?.transaction,
          where: { id: { [KOp("in")]: ids } }
        });
        return this
      case "belongsToMany":
        var throughData = []
        var fields = []
        for (const data_ of data) {
          throughData.push({
            [association.throughSourceKey]: this.id,
            [association.otherKey]: data_["id"],
            ...(data_[association.Through.name] || {})
          })
          fields.push(...Object.keys(data_[association.Through.name] || {}))
        }
        fields = [...new Set(fields)].filter(field => field != "id")
        console.log(`${association.Through.name}.bulkCreate`);
        console.log('throughData', throughData);
        console.log('fields', fields);
        if (fields.length > 0)
          await association.Through.bulkCreate(throughData, { updateOnDuplicate: fields, transaction: options?.transaction, })
        else
          await association.Through.bulkCreate(throughData, { ignoreDuplicates: true, transaction: options?.transaction, })
        return this
    }
  }
  public async SetAssociation(name: string, values: any | any[], options?: InstanceUpdateOptions | undefined): Promise<this> {
    console.log(`${this.Model.name}[${this.id}].SetAssociation(${name})`);
    console.log(values);

    const association = this.Model.finalAssociations[name]
    if (!association) throw `Unvalid Association ${this.Model.name}.${name}`
    let _values: any[] = Array.isArray(values) ? values : [values]
    _values = KArray.clense(_values);
    let data = KArray.toRecords(_values, "id");
    let ids = KArray.get(data, "id");
    await this.LinkAssociation(name, values, options)
    switch (association.type) {
      case "belongsTo":
      case "hasOne":
        return this
      case "hasMany":
        await association.Target.update({ [association.targetKey]: null }, {
          transaction: options?.transaction,
          where: {
            [association.targetKey]: this.get(association.sourceKey),
            id: { [KOp("notIn")]: ids },
          }
        });
        return this
      case "belongsToMany":
        await association.Through.destroy({
          transaction: options?.transaction,
          where: {
            [association.throughSourceKey]: this.id,
            [association.otherKey]: ids,
          },
        })
        return this
    }
  }
  public async CreateAssociation(name: string, values?: any, options?: CreateOptions | undefined): Promise<KishiModel[]> {
    console.log(`${this.Model.name}[${this.id}].CreateAssociation(${name})`);
    const association = this.Model.finalAssociations[name]
    if (!association) throw `Unvalid Association ${this.Model.name}.${name}`
    let _values: any[] = Array.isArray(values) ? values : [values]
    _values = KArray.clense(_values);
    console.log(values);
    let created: KishiModel[] = []
    for (let data of _values) {
      if (["hasOne", "hasMany"].includes(association.type))
        data[association.targetKey] = this.get(association.sourceKey)
      const created_ = await association.Target.Create(data)
      if (association.type == "belongsToMany") {
        data.id = created_.id
        await this.LinkAssociation(name, data)
      }
      created.push(created_);
    }
    return created
  }
  public async UpdateAssociation(name: string, values?: any | any[], options?: InstanceUpdateOptions | undefined): Promise<KishiModel[]> {
    console.log(`${this.Model.name}[${this.id}].UpdateAssociation(${name})`);
    console.log(values);
    const association = this.Model.finalAssociations[name]
    if (!association) throw `Unvalid Association ${this.Model.name}.${name}`
    if (!values) return []
    let _values: any[] = Array.isArray(values) ? values : [values]
    let data = KArray.toRecords(_values, "id");
    let ids = KArray.get(data, "id");
    let associated = await association.Target.findAll({
      where: {
        id: { [KOp("in")]: ids },
        ...(association.type != "belongsToMany" ? { [association.targetKey]: this.get(association.sourceKey) } : {}),
      }
    })
    let updated = []
    for (let data_ of data) {
      let associated_ = associated.find(row => row.id == data_.id)
      if (!associated_) {
        console.warn({
          message: "UpdateAssociation: associated Not Found",
          path: `${Model.name}.${name}`,
          modelId: this.id,
          data_,
          stack: new Error().stack
        });
        continue
      }
      updated.push(await associated_.Update(data_))
    }
    return updated
  }
  public async UpsertAssociation(name: string, values?: any | any[], options?: InstanceUpdateOptions | undefined): Promise<[KishiModel, boolean][]> {
    console.log(`${this.Model.name}[${this.id}].UpsertAssociation(${name})`);
    console.log(values);
    const association = this.Model.finalAssociations[name]
    if (!association) throw `Unvalid Association ${this.Model.name}.${name}`
    if (!values) return []
    let _values: any[] = Array.isArray(values) ? values : [values]
    let data = KArray.toRecords(_values, "id");
    let upserted: [KishiModel, boolean][] = []
    for (let data_ of data) {
      if (["hasOne", "hasMany"].includes(association.type))
        data_[association.targetKey] = this.get(association.sourceKey)
      const upserted_ = await association.Target.Upsert(data_)
      if (association.type == "belongsToMany") {
        data_.id = upserted_[0].id
        await this.LinkAssociation(name, data)
      }
      upserted.push(upserted_)
    }
    return upserted
  }

  public static async Create(values?: any | undefined, options?: CreateOptions | undefined): Promise<KishiModel> {
    if (!options?.transaction) {
      let _options = (options || {}) as CreateOptions
      const result = await this.sequelize?.transaction(async (transaction) => {
        _options.transaction = transaction
        return await this.Create(values, _options)
      })
      return result as KishiModel
    }
    values = values || {};
    if (this.ParentModel?.parentOptions) {
      const { descriminator } = this.ParentModel.parentOptions
      values[this.ParentModel.name] = values[this.ParentModel.name] || {}
      values[this.ParentModel.name][descriminator] = this.name
    }
    for (const InterfaceModel of this.InterfaceModels || []) {
      const { descriminator = "" } = InterfaceModel.interfaceOptions || {}
      values[InterfaceModel.name] = values[InterfaceModel.name] || {}
      values[InterfaceModel.name][descriminator] = this.name
    }
    const associations = this.finalAssociations;
    for (const name in associations) {
      let association = associations[name]
      if (!values[name]) continue
      const { foreignName, Target } = association
      switch (association.type) {
        case "belongsTo":
          if (!values[foreignName]) {
            const createdAssociation = await Target.Create(values[name], options)
            values[foreignName] = createdAssociation.id
          }
          break;
      }
    }
    const created = await this.create(values, options)
    try {
      for (const name in associations) {
        let association = associations[name]
        if (!values[name]) continue
        let datas: any[] = Array.isArray(values[name]) ? values[name] : [values[name]]
        datas = datas.filter(data => data)
        const { foreignName, Target } = association
        switch (association.type) {
          case "hasOne":
          case "hasMany":
            for (let data of datas) {
              data[foreignName] = created.id
              await Target.Create(data, options)
            }
            break;
          case "belongsToMany":
            const { Through, throughSourceKey, otherKey } = association
            for (let data of datas) {
              if (!(data instanceof Object)) {
                data = { "id": data }
              }

              let throughData: any = {}
              throughData[throughSourceKey] = created.id
              throughData[otherKey] = data.id
              if (data[Through.name])
                defaults(throughData, data[Through.name])
              await Through.Create(throughData, options)
            }
            break;
        }
      }
    } catch (error) {
      throw error
    }
    return created
  }


  public async Update(values?: any | undefined, options?: InstanceUpdateOptions | undefined): Promise<this> {
    if (!options?.transaction) {
      let _options = (options || {}) as InstanceUpdateOptions
      const result = await this.sequelize?.transaction(async (transaction) => {
        _options.transaction = transaction
        return await this.Update(values, _options)
      })
      return result as this
    }
    values = values || {}
    const associations = this.Model.finalAssociations;
    //Link
    for (const name in associations) {
      let association = associations[name]
      if (association.type != "belongsTo") continue
      const { foreignName, Target } = association
      if (values[name] === undefined)
        continue
      if (!values[name]) {
        values[foreignName] = null
        continue
      }
      console.log(`${this.Model.name}[${this.id}].UpdateAction[${name}]:${association.actionMap.Update}`);
      switch (association.actionMap.Update) {
        case "Update":
          await this.UpdateAssociation(name, values[name], options)
          break;
        case "Upsert":
          if (this.get(foreignName)) {
            await this.UpdateAssociation(name, values[name], options)
          } else {
            const createdAssociation = await this.CreateAssociation(name, values[name], options)
            values[foreignName] = createdAssociation[0]?.id
          }
          break;
      }
    }
    await this.update(values, options)
    for (const name in associations) {
      let association = associations[name]
      if (association.type == "belongsTo") continue
      const { foreignName } = association
      if (values[name] != undefined) {
        if (association.actionMap.Update == null)
          continue
        if (!values[name]) {
          values[foreignName] = null
          continue
        }
        let _values: any[] = Array.isArray(values[name]) ? values[name] : [values[name]]
        let data = KArray.toRecords(_values, "id");
        let ids = KArray.get(data, "id").filter(id => id)
        const toUpdate = data.filter(row => row.id)
        let upserted: [KishiModel, boolean][] = []
        let updated: KishiModel[] = []
        console.log(`${this.Model.name}[${this.id}].UpdateAction[${name}]:${association.actionMap.Update}`);
        switch (association.actionMap.Update) {
          case "Update":
            updated = await this.UpdateAssociation(name, toUpdate, options)
            break;
          case "Upsert":
            upserted = await this.UpsertAssociation(name, data, options)
            break;
          case "UpsertRemove":
            upserted = await this.UpsertAssociation(name, data, options)
            ids = KArray.get(upserted, [0, "id"]);
            //remove rest
            await this.SetAssociation(name, ids, options)
            break;
          case "UpsertDel":
            upserted = await this.UpsertAssociation(name, data, options)
            ids = KArray.get(upserted, [0, "id"]);
            //delete rest
            await association.Target.destroy({
              transaction: options.transaction,
              where: {
                [association.targetKey]: this.get(association.sourceKey),
                id: { [KOp("notIn")]: ids },
              }
            });
            break;
        }
        if (upserted.length > 0) {
          ids = KArray.get(upserted, [0, "id"]);
          console.log(ids);
        }
      } else if (values[association.idName] != undefined) {
        if (association.actionMap.Link == null)
          continue
        let _values: any[] = Array.isArray(values[association.idName]) ? values[association.idName] : [values[association.idName]]
        let data = KArray.toRecords(_values, "id");
        let ids = KArray.get(data, "id").filter(id => id)
        console.log(`${this.Model.name}[${this.id}].UpdateAction[${name}]:${association.actionMap.Update}`);
        switch (association.actionMap.Link) {
          case "Add":
            await this.LinkAssociation(name, data, options)
            break;
          case "Set":
            await this.SetAssociation(name, data, options)
            break;
          case "SetDel":
            if (association.type != "hasMany") continue
            await this.LinkAssociation(name, ids, options)
            await association.Target.destroy({
              transaction: options.transaction,
              where: {
                [association.targetKey]: this.get(association.sourceKey),
                id: { [KOp("notIn")]: ids },
              }
            });
            break;
        }
      }
    }
    return this
  }
  static async Upsert(values?: any | undefined, options?: CreateOptions | undefined): Promise<[KishiModel, boolean]> {
    if (!options?.transaction) {
      let _options = (options || {}) as InstanceUpdateOptions
      const result = await this.sequelize?.transaction(async (transaction) => {
        _options.transaction = transaction
        return await this.Upsert(values, _options)
      })
      return result as [KishiModel, boolean]
    }
    let newRecord = true
    let where: WhereOptions | undefined = this.DataToWhere(values)
    if (where) {
      console.log(where);
      let toUpdate = await this.findOne({ where, transaction: options.transaction })
      if (toUpdate) {
        newRecord = false
        await toUpdate.Update(values, options)
        return [toUpdate, newRecord]
      }
    }

    const upserted = await this.Create(values, options)
      .catch(async err => {
        if (!err.fields)
          throw err
        console.error(err.fields);
        console.error(values);
        let where: any = {}
        if (err.fields["PRIMARY"]) {
          where["id"] = err.fields["PRIMARY"]
          delete err.fields["PRIMARY"]
        }
        for (const key in err.fields) {
          where[key] = values[key]
        }
        let toUpdate = await this.findOne({ where, transaction: options.transaction })
        newRecord = false
        if (!toUpdate) {
          throw {
            message: "toUpdate Not Found",
            modelName: this.name,
            values,
            where,
            fields: err.fields,
            err,
          }
        }
        return await toUpdate.Update(values, options)
      })
    return [upserted, newRecord]
  }
}


