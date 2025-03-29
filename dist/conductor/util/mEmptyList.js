"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mEmptyList = mEmptyList;
const types_1 = require("../types");
function mEmptyList(value = null) {
    return {
        type: types_1.DataType.EMPTY_LIST,
        value
    };
}
