"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.is_list = is_list;
const types_1 = require("../../types");
/**
 * Checks if a List is a true list (`tail(tail...(xs))` is empty-list).
 * @param xs The List to check.
 * @returns true if the provided List is a true list.
 */
function is_list(xs) {
    if (xs === null)
        return true; // TODO: figure out some way to avoid JS value comparison
    while (true) {
        const tail = this.pair_tail(xs);
        if (tail.type === types_1.DataType.EMPTY_LIST)
            return true;
        if (tail.type !== types_1.DataType.PAIR)
            return false;
        xs = tail.value;
    }
}
