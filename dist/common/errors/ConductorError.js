"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConductorError = void 0;
/**
 * Generic Conductor Error.
 */
class ConductorError extends Error {
    constructor(message) {
        super(message);
        this.name = "ConductorError";
        this.errorType = "__unknown" /* ErrorType.UNKNOWN */;
    }
}
exports.ConductorError = ConductorError;
