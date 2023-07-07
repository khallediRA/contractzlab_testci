'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "ContractUnion", deps: [TypeLevel1, TypeLevel2, TypeLevel3, Contract, ContractAI]
 * addColumn "level1Id" to table "Contract"
 * addColumn "level2Id" to table "Contract"
 * addColumn "level3Id" to table "Contract"
 * addColumn "level1Id" to table "ContractAI"
 * addColumn "level2Id" to table "ContractAI"
 * addColumn "level3Id" to table "ContractAI"
 * addIndex "ContractUnion_contract" to table "ContractUnion"
 * addIndex "ContractUnion_contractAI" to table "ContractUnion"
 *
 **/

var info = {
    "revision": 5,
    "name": "noname",
    "created": "2023-07-06T23:33:42.137Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "createTable",
        params: [
            "ContractUnion",
            {
                "id": {
                    "type": Sequelize.INTEGER,
                    "field": "id",
                    "autoIncrement": true,
                    "primaryKey": true
                },
                "type": {
                    "type": Sequelize.ENUM('Contract', 'ContractAI'),
                    "field": "type"
                },
                "clientId": {
                    "type": Sequelize.UUID,
                    "field": "clientId"
                },
                "name": {
                    "type": Sequelize.STRING,
                    "field": "name",
                    "binder": [{
                        "associationName": "contract",
                        "targetField": "name"
                    }, {
                        "associationName": "contractAI",
                        "targetField": "name"
                    }]
                },
                "level1Id": {
                    "type": Sequelize.INTEGER,
                    "onUpdate": "CASCADE",
                    "onDelete": "NO ACTION",
                    "references": {
                        "model": "TypeLevel1",
                        "key": "id"
                    },
                    "allowNull": true,
                    "field": "level1Id",
                    "binder": [{
                        "associationName": "contract",
                        "targetField": "level1Id"
                    }, {
                        "associationName": "contractAI",
                        "targetField": "level1Id"
                    }]
                },
                "level2Id": {
                    "type": Sequelize.INTEGER,
                    "onUpdate": "CASCADE",
                    "onDelete": "NO ACTION",
                    "references": {
                        "model": "TypeLevel2",
                        "key": "id"
                    },
                    "allowNull": true,
                    "field": "level2Id",
                    "binder": [{
                        "associationName": "contract",
                        "targetField": "level2Id"
                    }, {
                        "associationName": "contractAI",
                        "targetField": "level2Id"
                    }]
                },
                "level3Id": {
                    "type": Sequelize.INTEGER,
                    "onUpdate": "CASCADE",
                    "onDelete": "NO ACTION",
                    "references": {
                        "model": "TypeLevel3",
                        "key": "id"
                    },
                    "allowNull": true,
                    "field": "level3Id",
                    "binder": [{
                        "associationName": "contract",
                        "targetField": "level3Id"
                    }, {
                        "associationName": "contractAI",
                        "targetField": "level3Id"
                    }]
                },
                "createdAt": {
                    "type": Sequelize.DATE,
                    "field": "createdAt",
                    "allowNull": false
                },
                "updatedAt": {
                    "type": Sequelize.DATE,
                    "field": "updatedAt",
                    "allowNull": false
                },
                "contractId": {
                    "type": Sequelize.INTEGER,
                    "field": "contractId",
                    "onUpdate": "CASCADE",
                    "onDelete": "SET NULL",
                    "references": {
                        "model": "Contract",
                        "key": "id"
                    },
                    "allowNull": true
                },
                "contractAIId": {
                    "type": Sequelize.INTEGER,
                    "field": "contractAIId",
                    "onUpdate": "CASCADE",
                    "onDelete": "SET NULL",
                    "references": {
                        "model": "ContractAI",
                        "key": "id"
                    },
                    "allowNull": true
                }
            },
            {}
        ]
    },
    {
        fn: "addColumn",
        params: [
            "Contract",
            "level1Id",
            {
                "type": Sequelize.INTEGER,
                "onUpdate": "CASCADE",
                "onDelete": "NO ACTION",
                "references": {
                    "model": "TypeLevel1",
                    "key": "id"
                },
                "allowNull": true,
                "field": "level1Id",
                "fromView": false,
                "binder": {
                    "hardBind": true,
                    "associationName": "template",
                    "targetField": "level1Id"
                }
            }
        ]
    },
    {
        fn: "addColumn",
        params: [
            "Contract",
            "level2Id",
            {
                "type": Sequelize.INTEGER,
                "onUpdate": "CASCADE",
                "onDelete": "NO ACTION",
                "references": {
                    "model": "TypeLevel2",
                    "key": "id"
                },
                "allowNull": true,
                "field": "level2Id",
                "fromView": false,
                "binder": {
                    "hardBind": true,
                    "associationName": "template",
                    "targetField": "level2Id"
                }
            }
        ]
    },
    {
        fn: "addColumn",
        params: [
            "Contract",
            "level3Id",
            {
                "type": Sequelize.INTEGER,
                "onUpdate": "CASCADE",
                "onDelete": "NO ACTION",
                "references": {
                    "model": "TypeLevel3",
                    "key": "id"
                },
                "allowNull": true,
                "field": "level3Id",
                "fromView": false,
                "binder": {
                    "hardBind": true,
                    "associationName": "template",
                    "targetField": "level3Id"
                }
            }
        ]
    },
    {
        fn: "addColumn",
        params: [
            "ContractAI",
            "level1Id",
            {
                "type": Sequelize.INTEGER,
                "onUpdate": "CASCADE",
                "onDelete": "NO ACTION",
                "references": {
                    "model": "TypeLevel1",
                    "key": "id"
                },
                "allowNull": true,
                "field": "level1Id",
                "fromView": false,
                "binder": {
                    "hardBind": true,
                    "associationName": "form",
                    "targetField": "level1Id"
                }
            }
        ]
    },
    {
        fn: "addColumn",
        params: [
            "ContractAI",
            "level2Id",
            {
                "type": Sequelize.INTEGER,
                "onUpdate": "CASCADE",
                "onDelete": "NO ACTION",
                "references": {
                    "model": "TypeLevel2",
                    "key": "id"
                },
                "allowNull": true,
                "field": "level2Id",
                "fromView": false,
                "binder": {
                    "hardBind": true,
                    "associationName": "form",
                    "targetField": "level2Id"
                }
            }
        ]
    },
    {
        fn: "addColumn",
        params: [
            "ContractAI",
            "level3Id",
            {
                "type": Sequelize.INTEGER,
                "onUpdate": "CASCADE",
                "onDelete": "NO ACTION",
                "references": {
                    "model": "TypeLevel3",
                    "key": "id"
                },
                "allowNull": true,
                "field": "level3Id",
                "fromView": false,
                "binder": {
                    "hardBind": true,
                    "associationName": "form",
                    "targetField": "level3Id"
                }
            }
        ]
    },
    {
        fn: "addIndex",
        params: [
            "ContractUnion",
            ["type", "contractId"],
            {
                "indexName": "ContractUnion_contract",
                "name": "ContractUnion_contract",
                "indicesType": "UNIQUE",
                "type": "UNIQUE"
            }
        ]
    },
    {
        fn: "addIndex",
        params: [
            "ContractUnion",
            ["type", "contractAIId"],
            {
                "indexName": "ContractUnion_contractAI",
                "name": "ContractUnion_contractAI",
                "indicesType": "UNIQUE",
                "type": "UNIQUE"
            }
        ]
    }
];

module.exports = {
    pos: 0,
    up: function(queryInterface, Sequelize)
    {
        var index = this.pos;
        return new Promise(function(resolve, reject) {
          async function next() {
            if (index < migrationCommands.length) {
                let command = migrationCommands[index];
                console.log("[#" + index + "] execute: " + command.fn);
                index++;
                queryInterface[command.fn].apply(queryInterface, command.params).then(next, reject);
            }
            else
                resolve();
        }
            next();
        });
    },
    info: info
};
