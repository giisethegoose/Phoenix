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
var Index_1 = require("./Index");
var util_1 = require("../../util/util");
var Node_1 = require("../Node");
var LeafNode_1 = require("../LeafNode");
var nodeFromJSON;
var MAX_NODE;
function setNodeFromJSON(val) {
    nodeFromJSON = val;
}
exports.setNodeFromJSON = setNodeFromJSON;
function setMaxNode(val) {
    MAX_NODE = val;
}
exports.setMaxNode = setMaxNode;

var PriorityIndex = function (_super) {
    __extends(PriorityIndex, _super);
    function PriorityIndex() {
        return _super !== null && _super.apply(this, arguments) || this;
    }

    PriorityIndex.prototype.compare = function (a, b) {
        var aPriority = a.node.getPriority();
        var bPriority = b.node.getPriority();
        var indexCmp = aPriority.compareTo(bPriority);
        if (indexCmp === 0) {
            return util_1.nameCompare(a.name, b.name);
        } else {
            return indexCmp;
        }
    };

    PriorityIndex.prototype.isDefinedOn = function (node) {
        return !node.getPriority().isEmpty();
    };

    PriorityIndex.prototype.indexedValueChanged = function (oldNode, newNode) {
        return !oldNode.getPriority().equals(newNode.getPriority());
    };

    PriorityIndex.prototype.minPost = function () {
        return Node_1.NamedNode.MIN;
    };

    PriorityIndex.prototype.maxPost = function () {
        return new Node_1.NamedNode(util_1.MAX_NAME, new LeafNode_1.LeafNode('[PRIORITY-POST]', MAX_NODE));
    };

    PriorityIndex.prototype.makePost = function (indexValue, name) {
        var priorityNode = nodeFromJSON(indexValue);
        return new Node_1.NamedNode(name, new LeafNode_1.LeafNode('[PRIORITY-POST]', priorityNode));
    };

    PriorityIndex.prototype.toString = function () {
        return '.priority';
    };
    return PriorityIndex;
}(Index_1.Index);
exports.PriorityIndex = PriorityIndex;
exports.PRIORITY_INDEX = new PriorityIndex();