"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isReferenceType = isReferenceType;
const types_1 = require("../types");
const lookupTable = {
    [types_1.DataType.VOID]: false,
    [types_1.DataType.BOOLEAN]: false,
    [types_1.DataType.NUMBER]: false,
    [types_1.DataType.CONST_STRING]: false,
    [types_1.DataType.EMPTY_LIST]: true, // technically not; see list
    [types_1.DataType.PAIR]: true,
    [types_1.DataType.ARRAY]: true,
    [types_1.DataType.CLOSURE]: true,
    [types_1.DataType.OPAQUE]: true,
    [types_1.DataType.LIST]: true, // technically not, but easier to do this due to pair being so
};
function isReferenceType(type) {
    return lookupTable[type];
}
