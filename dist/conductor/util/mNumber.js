"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mNumber = mNumber;
const types_1 = require("../types");
function mNumber(value) {
    return {
        type: types_1.DataType.NUMBER,
        value
    };
}
