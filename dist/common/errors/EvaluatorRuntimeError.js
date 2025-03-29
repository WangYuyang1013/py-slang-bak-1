"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvaluatorRuntimeError = void 0;
const EvaluatorError_1 = require("./EvaluatorError");
/**
 * Evaluator runtime error - some problem occurred while running the user code.
 */
class EvaluatorRuntimeError extends EvaluatorError_1.EvaluatorError {
    constructor() {
        super(...arguments);
        this.name = "EvaluatorRuntimeError";
        this.errorType = "__evaluator_runtime" /* ErrorType.EVALUATOR_RUNTIME */;
    }
}
exports.EvaluatorRuntimeError = EvaluatorRuntimeError;
