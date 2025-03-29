"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TooManyPositionalArgumentsError = exports.MissingRequiredPositionalError = exports.TypeConcatenateError = void 0;
const types_1 = require("../types");
const runtimeSourceError_1 = require("./runtimeSourceError");
class TypeConcatenateError extends runtimeSourceError_1.RuntimeSourceError {
    constructor(node) {
        super(node);
        this.type = types_1.ErrorType.TYPE;
    }
    explain() {
        return `TypeError: can only concatenate str (not "int") to str.`;
    }
    elaborate() {
        return `You are trying to concatenate a string with an integer. To fix this, convert the integer to a string using str(), or ensure both operands are of the same type.`;
    }
}
exports.TypeConcatenateError = TypeConcatenateError;
class MissingRequiredPositionalError extends runtimeSourceError_1.RuntimeSourceError {
    constructor(node, functionName, params, args) {
        super(node);
        this.type = types_1.ErrorType.TYPE;
        this.functionName = functionName;
        this.missingParamCnt = params.length - args.length;
        const missingNames = [];
        for (let i = args.length; i < params.length; i++) {
            const param = params[i];
            missingNames.push("\'" + param.name + "\'");
        }
        this.missingParamName = this.joinWithCommasAndAnd(missingNames);
    }
    explain() {
        return `TypeError: ${this.functionName}() missing ${this.missingParamCnt} required positional argument: ${this.missingParamName}`;
    }
    elaborate() {
        return `You called ${this.functionName}() without providing the required positional argument ${this.missingParamName}. Make sure to pass all required arguments when calling ${this.functionName}.`;
    }
    joinWithCommasAndAnd(names) {
        if (names.length === 0) {
            return '';
        }
        else if (names.length === 1) {
            return names[0];
        }
        else if (names.length === 2) {
            return `${names[0]} and ${names[1]}`;
        }
        else {
            const last = names.pop();
            return `${names.join(', ')} and ${last}`;
        }
    }
}
exports.MissingRequiredPositionalError = MissingRequiredPositionalError;
class TooManyPositionalArgumentsError extends runtimeSourceError_1.RuntimeSourceError {
    constructor(node, functionName, params, args) {
        super(node);
        this.type = types_1.ErrorType.TYPE;
        this.functionName = functionName;
        this.expectedCount = params.length;
        this.givenCount = args.length;
    }
    explain() {
        return `TypeError: ${this.functionName}() takes ${this.expectedCount} positional arguments but ${this.givenCount} were given`;
    }
    elaborate() {
        return `You called ${this.functionName}() with ${this.givenCount} positional arguments, but it only expects ${this.expectedCount}. Make sure to pass the correct number of arguments when calling ${this.functionName}.`;
    }
}
exports.TooManyPositionalArgumentsError = TooManyPositionalArgumentsError;
