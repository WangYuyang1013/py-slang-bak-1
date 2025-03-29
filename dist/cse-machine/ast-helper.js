"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.literal = exports.isStatementSequence = exports.hasReturnStatementIf = exports.isIfStatement = exports.isReturnStatement = exports.hasReturnStatement = exports.returnStatement = exports.identifier = exports.declaration = exports.constantDeclaration = exports.blockStatement = exports.blockArrowFunction = exports.hasDeclarations = exports.isBlockStatement = exports.isNode = exports.statementSequence = void 0;
/**
 * Create a StatementSequence node.
 */
const statementSequence = (body, loc) => ({
    type: 'StatementSequence',
    body,
    loc,
    innerComments: undefined,
});
exports.statementSequence = statementSequence;
const isNode = (item) => {
    return typeof item === 'object' && item !== null && 'type' in item;
};
exports.isNode = isNode;
const isBlockStatement = (node) => {
    return node.type === 'BlockStatement';
};
exports.isBlockStatement = isBlockStatement;
const hasDeclarations = (node) => {
    return node.body.some(stmt => stmt.type === 'VariableDeclaration' || stmt.type === 'FunctionDeclaration');
};
exports.hasDeclarations = hasDeclarations;
const blockArrowFunction = (params, body, loc) => ({
    type: 'ArrowFunctionExpression',
    expression: false,
    generator: false,
    params,
    body: Array.isArray(body) ? (0, exports.blockStatement)(body) : body,
    loc
});
exports.blockArrowFunction = blockArrowFunction;
const blockStatement = (body, loc) => ({
    type: 'BlockStatement',
    body,
    loc
});
exports.blockStatement = blockStatement;
const constantDeclaration = (name, init, loc) => (0, exports.declaration)(name, 'declaration', init, loc);
exports.constantDeclaration = constantDeclaration;
const declaration = (name, kind, init, loc) => ({
    type: 'VariableDeclaration',
    declarations: [
        {
            type: 'VariableDeclarator',
            id: (0, exports.identifier)(name),
            init
        }
    ],
    kind: 'declaration',
    loc
});
exports.declaration = declaration;
const identifier = (name, loc) => ({
    type: 'Identifier',
    name,
    loc
});
exports.identifier = identifier;
const returnStatement = (argument, loc) => ({
    type: 'ReturnStatement',
    argument,
    loc
});
exports.returnStatement = returnStatement;
const hasReturnStatement = (block) => {
    let hasReturn = false;
    for (const statement of block.body) {
        if ((0, exports.isReturnStatement)(statement)) {
            hasReturn = true;
        }
        else if ((0, exports.isIfStatement)(statement)) {
            // Parser enforces that if/else have braces (block statement)
            hasReturn = hasReturn || (0, exports.hasReturnStatementIf)(statement);
        }
        else if ((0, exports.isBlockStatement)(statement) || (0, exports.isStatementSequence)(statement)) {
            hasReturn = hasReturn && (0, exports.hasReturnStatement)(statement);
        }
    }
    return hasReturn;
};
exports.hasReturnStatement = hasReturnStatement;
const isReturnStatement = (node) => {
    return node.type == 'ReturnStatement';
};
exports.isReturnStatement = isReturnStatement;
const isIfStatement = (node) => {
    return node.type == 'IfStatement';
};
exports.isIfStatement = isIfStatement;
const hasReturnStatementIf = (statement) => {
    let hasReturn = true;
    // Parser enforces that if/else have braces (block statement)
    hasReturn = hasReturn && (0, exports.hasReturnStatement)(statement.consequent);
    if (statement.alternate) {
        if ((0, exports.isIfStatement)(statement.alternate)) {
            hasReturn = hasReturn && (0, exports.hasReturnStatementIf)(statement.alternate);
        }
        else if ((0, exports.isBlockStatement)(statement.alternate) || (0, exports.isStatementSequence)(statement.alternate)) {
            hasReturn = hasReturn && (0, exports.hasReturnStatement)(statement.alternate);
        }
    }
    return hasReturn;
};
exports.hasReturnStatementIf = hasReturnStatementIf;
const isStatementSequence = (node) => {
    return node.type == 'StatementSequence';
};
exports.isStatementSequence = isStatementSequence;
const literal = (value, loc) => ({
    type: 'Literal',
    value,
    loc
});
exports.literal = literal;
