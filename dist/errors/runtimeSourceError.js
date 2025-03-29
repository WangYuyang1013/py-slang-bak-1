"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuntimeSourceError = exports.UNKNOWN_LOCATION = void 0;
const types_1 = require("../types");
// todo
// just put on here temporarily
exports.UNKNOWN_LOCATION = {
    start: {
        line: -1,
        column: -1
    },
    end: {
        line: -1,
        column: -1
    }
};
class RuntimeSourceError {
    constructor(node) {
        var _a;
        this.type = types_1.ErrorType.RUNTIME;
        this.severity = types_1.ErrorSeverity.ERROR;
        this.message = 'Error';
        this.location = (_a = node === null || node === void 0 ? void 0 : node.loc) !== null && _a !== void 0 ? _a : exports.UNKNOWN_LOCATION;
    }
    explain() {
        return '';
    }
    elaborate() {
        return this.explain();
    }
}
exports.RuntimeSourceError = RuntimeSourceError;
