"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mClosure = mClosure;
const types_1 = require("../types");
function mClosure(value) {
    return {
        type: types_1.DataType.CLOSURE,
        value
    };
}
