"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("./constants");

exports.assert = function (assertion, message) {
  if (!assertion) {
    throw exports.assertionError(message);
  }
};

exports.assertionError = function (message) {
  return new Error('Firebase Database (' + constants_1.CONSTANTS.SDK_VERSION + ') INTERNAL ASSERT FAILED: ' + message);
};