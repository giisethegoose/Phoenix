"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

var promiseimpl = require("./promise_external");

function async(f) {
    return function () {
        var argsToForward = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            argsToForward[_i] = arguments[_i];
        }
        promiseimpl.resolve(true).then(function () {
            f.apply(null, argsToForward);
        });
    };
}
exports.async = async;