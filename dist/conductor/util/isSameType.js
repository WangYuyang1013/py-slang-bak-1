"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSameType = isSameType;
const types_1 = require("../types");
function isSameType(t1, t2) {
    if (t1 === t2)
        return true;
    if (t1 === types_1.DataType.LIST && (t2 === types_1.DataType.PAIR || t2 === types_1.DataType.EMPTY_LIST))
        return true;
    if (t2 === types_1.DataType.LIST && (t1 === types_1.DataType.PAIR || t1 === types_1.DataType.EMPTY_LIST))
        return true;
    return false;
}
