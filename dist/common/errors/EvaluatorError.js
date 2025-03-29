"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvaluatorError = void 0;
const ConductorError_1 = require("./ConductorError");
/**
 * Generic evaluation error, caused by a problem in user code.
 */
class EvaluatorError extends ConductorError_1.ConductorError {
    constructor(message, line, column, fileName) {
        const location = line !== undefined
            ? `${fileName ? fileName + ":" : ""}${line}${column !== undefined ? ":" + column : ""}: `
            : "";
        super(`${location}${message}`);
        this.name = "EvaluatorError";
        this.errorType = "__evaluator" /* ErrorType.EVALUATOR */;
        this.rawMessage = message;
        this.line = line;
        this.column = column;
        this.fileName = fileName;
    }
}
exports.EvaluatorError = EvaluatorError;
