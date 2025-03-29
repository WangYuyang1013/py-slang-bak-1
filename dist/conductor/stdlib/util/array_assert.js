"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.array_assert = array_assert;
const errors_1 = require("../../../common/errors");
const types_1 = require("../../types");
const util_1 = require("../../util");
function array_assert(a, type, length) {
    if (type) {
        const t = this.array_type(a);
        if (!(0, util_1.isSameType)(t, type))
            throw new errors_1.EvaluatorTypeError("Array type assertion failure", types_1.DataType[type], types_1.DataType[t]);
    }
    if (length) {
        const l = this.array_length(a);
        if (l !== length)
            throw new errors_1.EvaluatorTypeError("Array length assertion failure", String(length), String(l));
    }
}
