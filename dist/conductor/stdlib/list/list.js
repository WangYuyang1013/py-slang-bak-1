"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = list;
const mList_1 = require("../../util/mList");
/**
 * Creates a new List from given elements.
 * @param elements The elements of the List, given as typed values.
 * @returns The newly created List.
 */
function list(...elements) {
    let theList = (0, mList_1.mList)(null);
    for (let i = elements.length - 1; i >= 0; --i) {
        const p = (0, mList_1.mList)(this.pair_make(elements[i], theList));
        theList = p;
    }
    return theList;
}
