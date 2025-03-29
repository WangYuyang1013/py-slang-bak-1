"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mOpaque = mOpaque;
const types_1 = require("../types");
function mOpaque(value) {
    return {
        type: types_1.DataType.OPAQUE,
        value
    };
}
