"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mVoid = mVoid;
const types_1 = require("../types");
function mVoid(value = undefined) {
    return {
        type: types_1.DataType.VOID,
        value
    };
}
