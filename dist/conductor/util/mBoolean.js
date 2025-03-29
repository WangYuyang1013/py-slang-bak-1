"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mBoolean = mBoolean;
const types_1 = require("../types");
function mBoolean(value) {
    return {
        type: types_1.DataType.BOOLEAN,
        value
    };
}
