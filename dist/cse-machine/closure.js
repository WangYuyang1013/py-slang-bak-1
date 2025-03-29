"use strict";
// closure.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.isStatementSequence = exports.Closure = void 0;
const ast_helper_1 = require("./ast-helper");
class Closure {
    constructor(node, environment, context, predefined = false) {
        this.node = node;
        this.environment = environment;
        this.context = context;
        this.predefined = predefined;
        this.originalNode = node;
    }
    static makeFromArrowFunction(node, environment, context, dummyReturn = false, predefined = false) {
        const functionBody = !(0, ast_helper_1.isBlockStatement)(node.body) && !(0, exports.isStatementSequence)(node.body)
            ? (0, ast_helper_1.blockStatement)([(0, ast_helper_1.returnStatement)(node.body, node.body.loc)], node.body.loc)
            : dummyReturn && !(0, ast_helper_1.hasReturnStatement)(node.body)
                ? (0, ast_helper_1.blockStatement)([
                    ...node.body.body,
                    (0, ast_helper_1.returnStatement)((0, ast_helper_1.identifier)('undefined', node.body.loc), node.body.loc)
                ], node.body.loc)
                : node.body;
        const closure = new Closure((0, ast_helper_1.blockArrowFunction)(node.params, functionBody, node.loc), environment, context, predefined);
        closure.originalNode = node;
        return closure;
    }
}
exports.Closure = Closure;
const isStatementSequence = (node) => {
    return node.type == 'StatementSequence';
};
exports.isStatementSequence = isStatementSequence;
