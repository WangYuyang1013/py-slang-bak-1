"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.accumulate = accumulate;
/**
 * Accumulates a Closure over a List.
 *
 * The Closure is applied in a right-to-left order - the first application
 * will be on the last element of the list and the given initial value.
 * @param op The Closure to use as an accumulator over the List.
 * @param initial The initial typed value (that is, the result of accumulating an empty List).
 * @param sequence The List to be accumulated over.
 * @param resultType The (expected) type of the result.
 * @returns A Promise resolving to the result of accumulating the Closure over the List.
 */
function accumulate(op, initial, sequence, resultType) {
    return __awaiter(this, void 0, void 0, function* () {
        const vec = this.list_to_vec(sequence);
        let result = initial;
        for (let i = vec.length - 1; i >= 0; --i) {
            result = yield this.closure_call(op, [vec[i], result], resultType);
        }
        return result;
    });
}
