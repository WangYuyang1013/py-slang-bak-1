"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvaluatorSyntaxError = void 0;
const EvaluatorError_1 = require("./EvaluatorError");
/**
 * Evaluator syntax error - the user code does not follow the evaluator's prescribed syntax.
 */
class EvaluatorSyntaxError extends EvaluatorError_1.EvaluatorError {
    constructor() {
        super(...arguments);
        this.name = "EvaluatorSyntaxError";
        this.errorType = "__evaluator_syntax" /* ErrorType.EVALUATOR_SYNTAX */;
    }
}
exports.EvaluatorSyntaxError = EvaluatorSyntaxError;
