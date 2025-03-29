"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataType = void 0;
var DataType;
(function (DataType) {
    /** The return type of functions with no returned value. As a convention, the associated JS value is undefined. */
    DataType[DataType["VOID"] = 0] = "VOID";
    /** A Boolean value. */
    DataType[DataType["BOOLEAN"] = 1] = "BOOLEAN";
    /** A numerical value. */
    DataType[DataType["NUMBER"] = 2] = "NUMBER";
    /** An immutable string of characters. */
    DataType[DataType["CONST_STRING"] = 3] = "CONST_STRING";
    /** The empty list. As a convention, the associated JS value is null. */
    DataType[DataType["EMPTY_LIST"] = 4] = "EMPTY_LIST";
    /** A pair of values. Reference type. */
    DataType[DataType["PAIR"] = 5] = "PAIR";
    /** An array of values of a single type. Reference type. */
    DataType[DataType["ARRAY"] = 6] = "ARRAY";
    /** A value that can be called with fixed arity. Reference type. */
    DataType[DataType["CLOSURE"] = 7] = "CLOSURE";
    /** An opaque value that cannot be manipulated from user code. */
    DataType[DataType["OPAQUE"] = 8] = "OPAQUE";
    /** A list (either a pair or the empty list). */
    DataType[DataType["LIST"] = 9] = "LIST";
})(DataType || (exports.DataType = DataType = {}));
;
