"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidModuleError = void 0;
const errors_1 = require("../errors");
class InvalidModuleError extends errors_1.ConductorError {
    constructor() {
        super("Not a module");
        this.name = "InvalidModuleError";
        this.errorType = "__invalidmodule";
    }
}
exports.InvalidModuleError = InvalidModuleError;
