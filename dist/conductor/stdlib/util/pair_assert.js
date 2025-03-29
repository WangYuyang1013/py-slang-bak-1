"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pair_assert = pair_assert;
const errors_1 = require("../../../common/errors");
const types_1 = require("../../types");
const util_1 = require("../../util");
function pair_assert(p, headType, tailType) {
    if (headType) {
        const head = this.pair_head(p);
        if (!(0, util_1.isSameType)(head.type, headType))
            throw new errors_1.EvaluatorTypeError("Pair head assertion failure", types_1.DataType[headType], types_1.DataType[head.type]);
    }
    if (tailType) {
        const tail = this.pair_tail(p);
        if (!(0, util_1.isSameType)(tail.type, tailType))
            throw new errors_1.EvaluatorTypeError("Pair tail assertion failure", types_1.DataType[tailType], types_1.DataType[tail.type]);
    }
}
