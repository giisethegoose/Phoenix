"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Operation_1 = require("./Operation");
var Path_1 = require("../util/Path");

var Overwrite = function () {
    function Overwrite(source, path, snap) {
        this.source = source;
        this.path = path;
        this.snap = snap;

        this.type = Operation_1.OperationType.OVERWRITE;
    }
    Overwrite.prototype.operationForChild = function (childName) {
        if (this.path.isEmpty()) {
            return new Overwrite(this.source, Path_1.Path.Empty, this.snap.getImmediateChild(childName));
        } else {
            return new Overwrite(this.source, this.path.popFront(), this.snap);
        }
    };
    return Overwrite;
}();
exports.Overwrite = Overwrite;