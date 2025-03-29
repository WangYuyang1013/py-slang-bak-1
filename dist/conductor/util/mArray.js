"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mArray = mArray;
const types_1 = require("../types");
function mArray(value) {
    return {
        type: types_1.DataType.ARRAY,
        value
    };
}
