"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.list_to_vec = list_to_vec;
const errors_1 = require("../../../common/errors");
const types_1 = require("../../types");
function list_to_vec(xs) {
    const vec = [];
    if (xs === null)
        return vec;
    while (true) {
        vec.push(this.pair_head(xs));
        const tail = this.pair_tail(xs);
        if (tail.type === types_1.DataType.EMPTY_LIST)
            return vec;
        if (tail.type !== types_1.DataType.PAIR)
            throw new errors_1.EvaluatorTypeError("Input is not a list", types_1.DataType[types_1.DataType.LIST], types_1.DataType[tail.type]);
        xs = tail.value;
    }
}
