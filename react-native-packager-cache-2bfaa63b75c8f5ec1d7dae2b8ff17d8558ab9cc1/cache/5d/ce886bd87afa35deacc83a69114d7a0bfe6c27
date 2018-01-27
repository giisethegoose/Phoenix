"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("@firebase/util");
var util_2 = require("@firebase/util");

var StatsCollection = function () {
    function StatsCollection() {
        this.counters_ = {};
    }
    StatsCollection.prototype.incrementCounter = function (name, amount) {
        if (amount === void 0) {
            amount = 1;
        }
        if (!util_2.contains(this.counters_, name)) this.counters_[name] = 0;
        this.counters_[name] += amount;
    };
    StatsCollection.prototype.get = function () {
        return util_1.deepCopy(this.counters_);
    };
    return StatsCollection;
}();
exports.StatsCollection = StatsCollection;