"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unOpInstr = exports.conditionalExpression = exports.branchInstr = exports.resetInstr = exports.binOpInstr = exports.markerInstr = exports.envInstr = exports.appInstr = exports.assmtInstr = exports.popInstr = void 0;
const types_1 = require("./types");
const popInstr = (srcNode) => ({ instrType: types_1.InstrType.POP, srcNode });
exports.popInstr = popInstr;
const assmtInstr = (symbol, constant, declaration, srcNode) => ({
    instrType: types_1.InstrType.ASSIGNMENT,
    symbol,
    constant,
    declaration,
    srcNode
});
exports.assmtInstr = assmtInstr;
const appInstr = (numOfArgs, srcNode) => ({
    instrType: types_1.InstrType.APPLICATION,
    numOfArgs,
    srcNode
});
exports.appInstr = appInstr;
const envInstr = (env, srcNode) => ({
    instrType: types_1.InstrType.ENVIRONMENT,
    env,
    srcNode
});
exports.envInstr = envInstr;
const markerInstr = (srcNode) => ({
    instrType: types_1.InstrType.MARKER,
    srcNode
});
exports.markerInstr = markerInstr;
const binOpInstr = (symbol, srcNode) => ({
    instrType: types_1.InstrType.BINARY_OP,
    symbol,
    srcNode
});
exports.binOpInstr = binOpInstr;
const resetInstr = (srcNode) => ({
    instrType: types_1.InstrType.RESET,
    srcNode
});
exports.resetInstr = resetInstr;
const branchInstr = (consequent, alternate, srcNode) => ({
    instrType: types_1.InstrType.BRANCH,
    consequent,
    alternate,
    srcNode
});
exports.branchInstr = branchInstr;
const conditionalExpression = (test, consequent, alternate, loc) => ({
    type: 'ConditionalExpression',
    test,
    consequent,
    alternate,
    loc
});
exports.conditionalExpression = conditionalExpression;
const unOpInstr = (symbol, srcNode) => ({
    instrType: types_1.InstrType.UNARY_OP,
    symbol,
    srcNode
});
exports.unOpInstr = unOpInstr;
