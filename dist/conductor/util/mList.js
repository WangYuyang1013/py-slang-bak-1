"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mList = mList;
const types_1 = require("../types");
function mList(value) {
    return {
        type: types_1.DataType.LIST,
        value
    };
}
