"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mString = mString;
const types_1 = require("../types");
function mString(value) {
    return {
        type: types_1.DataType.CONST_STRING,
        value
    };
}
