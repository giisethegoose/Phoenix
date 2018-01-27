"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var app_1 = require("@firebase/app");
var Database_1 = require("./src/api/Database");
var Query_1 = require("./src/api/Query");
var Reference_1 = require("./src/api/Reference");
var util_1 = require("./src/core/util/util");
var RepoManager_1 = require("./src/core/RepoManager");
var INTERNAL = require("./src/api/internal");
var TEST_ACCESS = require("./src/api/test_access");
var util_2 = require("@firebase/util");
function registerDatabase(instance) {
    var namespace = instance.INTERNAL.registerService('database', function (app, unused, url) {
        return RepoManager_1.RepoManager.getInstance().databaseFromApp(app, url);
    }, {
        Reference: Reference_1.Reference,
        Query: Query_1.Query,
        Database: Database_1.Database,
        enableLogging: util_1.enableLogging,
        INTERNAL: INTERNAL,
        ServerValue: Database_1.Database.ServerValue,
        TEST_ACCESS: TEST_ACCESS
    }, null, true);
    if (util_2.isNodeSdk()) {
        module.exports = namespace;
    }
}
exports.registerDatabase = registerDatabase;
registerDatabase(app_1.default);