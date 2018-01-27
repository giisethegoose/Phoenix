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
var EventEmitter_1 = require("./EventEmitter");
var util_2 = require("@firebase/util");

var OnlineMonitor = function (_super) {
    __extends(OnlineMonitor, _super);
    function OnlineMonitor() {
        var _this = _super.call(this, ['online']) || this;
        _this.online_ = true;

        if (typeof window !== 'undefined' && typeof window.addEventListener !== 'undefined' && !util_2.isMobileCordova()) {
            window.addEventListener('online', function () {
                if (!_this.online_) {
                    _this.online_ = true;
                    _this.trigger('online', true);
                }
            }, false);
            window.addEventListener('offline', function () {
                if (_this.online_) {
                    _this.online_ = false;
                    _this.trigger('online', false);
                }
            }, false);
        }
        return _this;
    }
    OnlineMonitor.getInstance = function () {
        return new OnlineMonitor();
    };

    OnlineMonitor.prototype.getInitialEvent = function (eventType) {
        util_1.assert(eventType === 'online', 'Unknown event type: ' + eventType);
        return [this.online_];
    };

    OnlineMonitor.prototype.currentlyOnline = function () {
        return this.online_;
    };
    return OnlineMonitor;
}(EventEmitter_1.EventEmitter);
exports.OnlineMonitor = OnlineMonitor;