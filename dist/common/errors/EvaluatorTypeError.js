"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvaluatorTypeError = void 0;
const EvaluatorError_1 = require("./EvaluatorError");
/**
 * Evaluator type error - the user code is not well typed or provides values of incorrect type to external functions.
 */
class EvaluatorTypeError extends EvaluatorError_1.EvaluatorError {
    constructor(message, expected, actual, line, column, fileName) {
        super(`${message} (expected ${expected}, got ${actual})`, line, column, fileName);
        this.name = "EvaluatorTypeError";
        this.errorType = "__evaluator_type" /* ErrorType.EVALUATOR_TYPE */;
        this.rawMessage = message;
        this.expected = expected;
        this.actual = actual;
    }
}
exports.EvaluatorTypeError = EvaluatorTypeError;
