"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var promiseimpl = require("./promise_external");

var FailRequest = function () {
    function FailRequest(error) {
        this.promise_ = promiseimpl.reject(error);
    }

    FailRequest.prototype.getPromise = function () {
        return this.promise_;
    };

    FailRequest.prototype.cancel = function (appDelete) {
        if (appDelete === void 0) {
            appDelete = false;
        }
    };
    return FailRequest;
}();
exports.FailRequest = FailRequest;