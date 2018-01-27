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
var Node_1 = require("../Node");
var util_1 = require("../../util/util");
var nodeFromJSON_1 = require("../nodeFromJSON");

var ValueIndex = function (_super) {
    __extends(ValueIndex, _super);
    function ValueIndex() {
        return _super !== null && _super.apply(this, arguments) || this;
    }

    ValueIndex.prototype.compare = function (a, b) {
        var indexCmp = a.node.compareTo(b.node);
        if (indexCmp === 0) {
            return util_1.nameCompare(a.name, b.name);
        } else {
            return indexCmp;
        }
    };

    ValueIndex.prototype.isDefinedOn = function (node) {
        return true;
    };

    ValueIndex.prototype.indexedValueChanged = function (oldNode, newNode) {
        return !oldNode.equals(newNode);
    };

    ValueIndex.prototype.minPost = function () {
        return Node_1.NamedNode.MIN;
    };

    ValueIndex.prototype.maxPost = function () {
        return Node_1.NamedNode.MAX;
    };

    ValueIndex.prototype.makePost = function (indexValue, name) {
        var valueNode = nodeFromJSON_1.nodeFromJSON(indexValue);
        return new Node_1.NamedNode(name, valueNode);
    };

    ValueIndex.prototype.toString = function () {
        return '.value';
    };
    return ValueIndex;
}(Index_1.Index);
exports.ValueIndex = ValueIndex;
exports.VALUE_INDEX = new ValueIndex();