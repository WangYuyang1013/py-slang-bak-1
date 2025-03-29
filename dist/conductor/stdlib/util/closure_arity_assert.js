"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closure_arity_assert = closure_arity_assert;
const errors_1 = require("../../../common/errors");
function closure_arity_assert(c, arity) {
    const a = this.closure_arity(c);
    if (this.closure_is_vararg(c) ? arity < a : arity !== a) {
        throw new errors_1.EvaluatorTypeError("Closure arity assertion failure", String(arity), String(a));
    }
}
