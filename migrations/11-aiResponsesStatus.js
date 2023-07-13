'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "aiResponsesStatus" to table "ContractAI"
 *
 **/

var info = {
    "revision": 11,
    "name": "noname",
    "created": "2023-07-13T18:33:51.776Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "addColumn",
    params: [
        "ContractAI",
        "aiResponsesStatus",
        {
            "type": Sequelize.TEXT,
            "field": "aiResponsesStatus",
            "ts_typeStr": "[string, string][]"
        }
    ]
}];

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
