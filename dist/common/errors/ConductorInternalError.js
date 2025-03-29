"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConductorInternalError = void 0;
const ConductorError_1 = require("./ConductorError");
/**
 * Conductor internal error, probably caused by developer oversight.
 */
class ConductorInternalError extends ConductorError_1.ConductorError {
    constructor(message) {
        super(message);
        this.name = "ConductorInternalError";
        this.errorType = "__internal" /* ErrorType.INTERNAL */;
    }
}
exports.ConductorInternalError = ConductorInternalError;
