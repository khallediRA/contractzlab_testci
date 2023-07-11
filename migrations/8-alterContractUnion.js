'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * removeColumn "createdAt" from table "ContractUnion"
 * removeColumn "updatedAt" from table "ContractUnion"
 * addColumn "createdAt" to table "ContractUnion"
 * addColumn "updatedAt" to table "ContractUnion"
 * addColumn "status" to table "ContractUnion"
 *
 **/

var info = {
    "revision": 8,
    "name": "noname",
    "created": "2023-07-11T10:49:10.769Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "removeColumn",
        params: ["ContractUnion", "createdAt"]
    },
    {
        fn: "removeColumn",
        params: ["ContractUnion", "updatedAt"]
    },{
        fn: "addColumn",
        params: [
            "ContractUnion",
            "createdAt",
            {
                "type": Sequelize.DATE,
                "field": "createdAt",
                "binder": [{
                    "associationName": "contract",
                    "targetField": "createdAt"
                }, {
                    "associationName": "contractAI",
                    "targetField": "createdAt"
                }]
            }
        ]
    },
    {
        fn: "addColumn",
        params: [
            "ContractUnion",
            "updatedAt",
            {
                "type": Sequelize.DATE,
                "field": "updatedAt",
                "binder": [{
                    "associationName": "contract",
                    "targetField": "updatedAt"
                }, {
                    "associationName": "contractAI",
                    "targetField": "updatedAt"
                }]
            }
        ]
    },
    {
        fn: "addColumn",
        params: [
            "ContractUnion",
            "status",
            {
                "type": Sequelize.STRING,
                "field": "status",
                "binder": [{
                    "associationName": "contract",
                    "targetField": "status"
                }, {
                    "associationName": "contractAI",
                    "targetField": "status"
                }]
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
