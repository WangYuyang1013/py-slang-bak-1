"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mPair = mPair;
const types_1 = require("../types");
function mPair(value) {
    return {
        type: types_1.DataType.PAIR,
        value
    };
}
