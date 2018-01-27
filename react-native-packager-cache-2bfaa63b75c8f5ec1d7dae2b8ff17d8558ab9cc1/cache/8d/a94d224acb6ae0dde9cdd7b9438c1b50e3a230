"use strict";

var __extends = this && this.__extends || function () {
    var extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
        d.__proto__ = b;
    } || function (d, b) {
        for (var p in b) {
            if (b.hasOwnProperty(p)) d[p] = b[p];
        }
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() {
            this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
}();
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("@firebase/util");
var util_2 = require("../../util/util");
var Index_1 = require("./Index");
var ChildrenNode_1 = require("../ChildrenNode");
var Node_1 = require("../Node");
var nodeFromJSON_1 = require("../nodeFromJSON");

var PathIndex = function (_super) {
    __extends(PathIndex, _super);
    function PathIndex(indexPath_) {
        var _this = _super.call(this) || this;
        _this.indexPath_ = indexPath_;
        util_1.assert(!indexPath_.isEmpty() && indexPath_.getFront() !== '.priority', "Can't create PathIndex with empty path or .priority key");
        return _this;
    }

    PathIndex.prototype.extractChild = function (snap) {
        return snap.getChild(this.indexPath_);
    };

    PathIndex.prototype.isDefinedOn = function (node) {
        return !node.getChild(this.indexPath_).isEmpty();
    };

    PathIndex.prototype.compare = function (a, b) {
        var aChild = this.extractChild(a.node);
        var bChild = this.extractChild(b.node);
        var indexCmp = aChild.compareTo(bChild);
        if (indexCmp === 0) {
            return util_2.nameCompare(a.name, b.name);
        } else {
            return indexCmp;
        }
    };

    PathIndex.prototype.makePost = function (indexValue, name) {
        var valueNode = nodeFromJSON_1.nodeFromJSON(indexValue);
        var node = ChildrenNode_1.ChildrenNode.EMPTY_NODE.updateChild(this.indexPath_, valueNode);
        return new Node_1.NamedNode(name, node);
    };

    PathIndex.prototype.maxPost = function () {
        var node = ChildrenNode_1.ChildrenNode.EMPTY_NODE.updateChild(this.indexPath_, ChildrenNode_1.MAX_NODE);
        return new Node_1.NamedNode(util_2.MAX_NAME, node);
    };

    PathIndex.prototype.toString = function () {
        return this.indexPath_.slice().join('/');
    };
    return PathIndex;
}(Index_1.Index);
exports.PathIndex = PathIndex;