"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Operation_1 = require("./Operation");
var Overwrite_1 = require("./Overwrite");
var Path_1 = require("../util/Path");
var util_1 = require("@firebase/util");

var Merge = function () {
    function Merge(source, path, children) {
        this.source = source;
        this.path = path;
        this.children = children;

        this.type = Operation_1.OperationType.MERGE;
    }

    Merge.prototype.operationForChild = function (childName) {
        if (this.path.isEmpty()) {
            var childTree = this.children.subtree(new Path_1.Path(childName));
            if (childTree.isEmpty()) {
                return null;
            } else if (childTree.value) {
                return new Overwrite_1.Overwrite(this.source, Path_1.Path.Empty, childTree.value);
            } else {
                return new Merge(this.source, Path_1.Path.Empty, childTree);
            }
        } else {
            util_1.assert(this.path.getFront() === childName, "Can't get a merge for a child not on the path of the operation");
            return new Merge(this.source, this.path.popFront(), this.children);
        }
    };

    Merge.prototype.toString = function () {
        return 'Operation(' + this.path + ': ' + this.source.toString() + ' merge: ' + this.children.toString() + ')';
    };
    return Merge;
}();
exports.Merge = Merge;