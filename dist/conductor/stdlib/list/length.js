"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.length = length;
const errors_1 = require("../../../common/errors");
const types_1 = require("../../types");
/**
 * Gets the length of a List.
 * @param xs The List to get the length of.
 * @returns The length of the List.
 */
function length(xs) {
    let length = 0;
    if (xs === null)
        return length; // TODO: figure out some way to avoid JS value comparison
    while (true) {
        length++;
        const tail = this.pair_tail(xs);
        if (tail.type === types_1.DataType.EMPTY_LIST)
            return length;
        if (tail.type !== types_1.DataType.PAIR)
            throw new errors_1.EvaluatorTypeError("Input is not a list", types_1.DataType[types_1.DataType.LIST], types_1.DataType[tail.type]);
        xs = tail.value;
    }
}
