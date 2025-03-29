"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCSEMachine = runCSEMachine;
const interpreter_1 = require("../cse-machine/interpreter");
function runCSEMachine(program, context, options = {}) {
    const value = (0, interpreter_1.evaluate)(program, context, options);
    return (0, interpreter_1.CSEResultPromise)(context, value);
}
