'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "userPrompt" to table "ContractAIForm"
 * addColumn "systemPrompt" to table "ContractAIForm"
 *
 **/

var info = {
    "revision": 2,
    "name": "noname",
    "created": "2023-06-10T12:25:15.844Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "addColumn",
        params: [
            "ContractAIForm",
            "userPrompt",
            {
                "type": Sequelize.STRING,
                "field": "userPrompt"
            }
        ]
    },
    {
        fn: "addColumn",
        params: [
            "ContractAIForm",
            "systemPrompt",
            {
                "type": Sequelize.STRING,
                "field": "systemPrompt"
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
