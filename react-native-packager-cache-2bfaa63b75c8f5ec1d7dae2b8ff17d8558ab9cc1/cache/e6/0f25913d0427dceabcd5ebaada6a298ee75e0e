"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("../core/util/util");
var parser_1 = require("../core/util/libs/parser");
var Path_1 = require("../core/util/Path");
var Reference_1 = require("./Reference");
var Repo_1 = require("../core/Repo");
var RepoManager_1 = require("../core/RepoManager");
var util_2 = require("@firebase/util");
var validation_1 = require("../core/util/validation");

var Database = function () {
    function Database(repo_) {
        this.repo_ = repo_;
        if (!(repo_ instanceof Repo_1.Repo)) {
            util_1.fatal("Don't call new Database() directly - please use firebase.database().");
        }

        this.root_ = new Reference_1.Reference(repo_, Path_1.Path.Empty);
        this.INTERNAL = new DatabaseInternals(this);
    }
    Object.defineProperty(Database.prototype, "app", {
        get: function get() {
            return this.repo_.app;
        },
        enumerable: true,
        configurable: true
    });

    Database.prototype.ref = function (pathString) {
        this.checkDeleted_('ref');
        util_2.validateArgCount('database.ref', 0, 1, arguments.length);
        return pathString !== undefined ? this.root_.child(pathString) : this.root_;
    };

    Database.prototype.refFromURL = function (url) {
        var apiName = 'database.refFromURL';
        this.checkDeleted_(apiName);
        util_2.validateArgCount(apiName, 1, 1, arguments.length);
        var parsedURL = parser_1.parseRepoInfo(url);
        validation_1.validateUrl(apiName, 1, parsedURL);
        var repoInfo = parsedURL.repoInfo;
        if (repoInfo.host !== this.repo_.repoInfo_.host) {
            util_1.fatal(apiName + ': Host name does not match the current database: ' + '(found ' + repoInfo.host + ' but expected ' + this.repo_.repoInfo_.host + ')');
        }
        return this.ref(parsedURL.path.toString());
    };

    Database.prototype.checkDeleted_ = function (apiName) {
        if (this.repo_ === null) {
            util_1.fatal('Cannot call ' + apiName + ' on a deleted database.');
        }
    };

    Database.prototype.goOffline = function () {
        util_2.validateArgCount('database.goOffline', 0, 0, arguments.length);
        this.checkDeleted_('goOffline');
        this.repo_.interrupt();
    };
    Database.prototype.goOnline = function () {
        util_2.validateArgCount('database.goOnline', 0, 0, arguments.length);
        this.checkDeleted_('goOnline');
        this.repo_.resume();
    };
    Database.ServerValue = {
        TIMESTAMP: {
            '.sv': 'timestamp'
        }
    };
    return Database;
}();
exports.Database = Database;
var DatabaseInternals = function () {
    function DatabaseInternals(database) {
        this.database = database;
    }

    DatabaseInternals.prototype.delete = function () {
        this.database.checkDeleted_('delete');
        RepoManager_1.RepoManager.getInstance().deleteRepo(this.database.repo_);
        this.database.repo_ = null;
        this.database.root_ = null;
        this.database.INTERNAL = null;
        this.database = null;
        return Promise.resolve();
    };
    return DatabaseInternals;
}();
exports.DatabaseInternals = DatabaseInternals;