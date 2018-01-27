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
var util_2 = require("@firebase/util");
var __EMPTY_NODE;
var KeyIndex = function (_super) {
    __extends(KeyIndex, _super);
    function KeyIndex() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(KeyIndex, "__EMPTY_NODE", {
        get: function get() {
            return __EMPTY_NODE;
        },
        set: function set(val) {
            __EMPTY_NODE = val;
        },
        enumerable: true,
        configurable: true
    });

    KeyIndex.prototype.compare = function (a, b) {
        return util_1.nameCompare(a.name, b.name);
    };

    KeyIndex.prototype.isDefinedOn = function (node) {
        throw util_2.assertionError('KeyIndex.isDefinedOn not expected to be called.');
    };

    KeyIndex.prototype.indexedValueChanged = function (oldNode, newNode) {
        return false;
    };

    KeyIndex.prototype.minPost = function () {
        return Node_1.NamedNode.MIN;
    };

    KeyIndex.prototype.maxPost = function () {
        return new Node_1.NamedNode(util_1.MAX_NAME, __EMPTY_NODE);
    };

    KeyIndex.prototype.makePost = function (indexValue, name) {
        util_2.assert(typeof indexValue === 'string', 'KeyIndex indexValue must always be a string.');

        return new Node_1.NamedNode(indexValue, __EMPTY_NODE);
    };

    KeyIndex.prototype.toString = function () {
        return '.key';
    };
    return KeyIndex;
}(Index_1.Index);
exports.KeyIndex = KeyIndex;
exports.KEY_INDEX = new KeyIndex();