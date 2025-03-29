"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRuntimeError = exports.reduceConditional = exports.isSimpleFunction = exports.isInstr = exports.checkNumberOfArguments = exports.checkStackOverFlow = exports.getVariable = exports.valueProducing = exports.handleSequence = exports.envChanging = exports.propertySetter = exports.isIdentifier = void 0;
exports.isEnvDependent = isEnvDependent;
exports.declareFunctionsAndVariables = declareFunctionsAndVariables;
exports.declareIdentifier = declareIdentifier;
exports.defineVariable = defineVariable;
exports.pythonMod = pythonMod;
const ast_helper_1 = require("./ast-helper");
const environment_1 = require("./environment");
const types_1 = require("./types");
const instr = __importStar(require("./instrCreator"));
const closure_1 = require("./closure");
const errors_1 = require("../errors/errors");
const isIdentifier = (node) => {
    return node.name !== undefined;
};
exports.isIdentifier = isIdentifier;
const setToTrue = (item) => {
    item.isEnvDependent = true;
    return item;
};
const setToFalse = (item) => {
    item.isEnvDependent = false;
    return item;
};
const propertySetter = new Map([
    // AST Nodes
    [
        'Program',
        (item) => {
            const node = item;
            node.isEnvDependent = node.body.some(elem => isEnvDependent(elem));
            return node;
        }
    ],
    ['Literal', setToFalse],
    ['ImportDeclaration', setToFalse],
    ['BreakStatement', setToFalse],
    ['ContinueStatement', setToFalse],
    ['DebuggerStatement', setToFalse],
    ['VariableDeclaration', setToTrue],
    ['FunctionDeclaration', setToTrue],
    ['ArrowFunctionExpression', setToTrue],
    ['Identifier', setToTrue],
    [
        'LogicalExpression',
        (item) => {
            const node = item;
            node.isEnvDependent = isEnvDependent(node.left) || isEnvDependent(node.right);
            return node;
        }
    ],
    [
        'BinaryExpression',
        (item) => {
            const node = item;
            node.isEnvDependent = isEnvDependent(node.left) || isEnvDependent(node.right);
            return node;
        }
    ],
    [
        'UnaryExpression',
        (item) => {
            const node = item;
            node.isEnvDependent = isEnvDependent(node.argument);
            return node;
        }
    ],
    [
        'ConditionalExpression',
        (item) => {
            const node = item;
            node.isEnvDependent =
                isEnvDependent(node.consequent) ||
                    isEnvDependent(node.alternate) ||
                    isEnvDependent(node.test);
            return node;
        }
    ],
    [
        'MemberExpression',
        (item) => {
            const node = item;
            node.isEnvDependent = isEnvDependent(node.property) || isEnvDependent(node.object);
            return node;
        }
    ],
    [
        'ArrayExpression',
        (item) => {
            const node = item;
            node.isEnvDependent = node.elements.some(elem => isEnvDependent(elem));
            return node;
        }
    ],
    [
        'AssignmentExpression',
        (item) => {
            const node = item;
            node.isEnvDependent = isEnvDependent(node.left) || isEnvDependent(node.right);
            return node;
        }
    ],
    [
        'ReturnStatement',
        (item) => {
            const node = item;
            node.isEnvDependent = isEnvDependent(node.argument);
            return node;
        }
    ],
    [
        'CallExpression',
        (item) => {
            const node = item;
            node.isEnvDependent =
                isEnvDependent(node.callee) || node.arguments.some(arg => isEnvDependent(arg));
            return node;
        }
    ],
    [
        'ExpressionStatement',
        (item) => {
            const node = item;
            node.isEnvDependent = isEnvDependent(node.expression);
            return node;
        }
    ],
    [
        'IfStatement',
        (item) => {
            const node = item;
            node.isEnvDependent =
                isEnvDependent(node.test) ||
                    isEnvDependent(node.consequent) ||
                    isEnvDependent(node.alternate);
            return node;
        }
    ],
    [
        'ForStatement',
        (item) => {
            const node = item;
            node.isEnvDependent =
                isEnvDependent(node.body) ||
                    isEnvDependent(node.init) ||
                    isEnvDependent(node.test) ||
                    isEnvDependent(node.update);
            return node;
        }
    ],
    [
        'WhileStatement',
        (item) => {
            const node = item;
            node.isEnvDependent = isEnvDependent(node.body) || isEnvDependent(node.test);
            return node;
        }
    ],
    [
        'BlockStatement',
        (item) => {
            const node = item;
            node.isEnvDependent = node.body.some(stm => isEnvDependent(stm));
            return node;
        }
    ],
    [
        'StatementSequence',
        (item) => {
            const node = item;
            node.isEnvDependent = node.body.some(stm => isEnvDependent(stm));
            return node;
        }
    ],
    ['ImportSpecifier', setToTrue],
    ['ImportDefaultSpecifier', setToTrue],
    // InstrType
    [types_1.InstrType.RESET, setToFalse],
    [types_1.InstrType.UNARY_OP, setToFalse],
    [types_1.InstrType.BINARY_OP, setToFalse],
    [types_1.InstrType.CONTINUE, setToFalse],
    [types_1.InstrType.ASSIGNMENT, setToTrue],
    [
        types_1.InstrType.WHILE,
        (item) => {
            const instr = item;
            instr.isEnvDependent = isEnvDependent(instr.test) || isEnvDependent(instr.body);
            return instr;
        }
    ],
    [
        types_1.InstrType.FOR,
        (item) => {
            const instr = item;
            instr.isEnvDependent =
                isEnvDependent(instr.init) ||
                    isEnvDependent(instr.test) ||
                    isEnvDependent(instr.update) ||
                    isEnvDependent(instr.body);
            return instr;
        }
    ],
    [
        types_1.InstrType.BRANCH,
        (item) => {
            const instr = item;
            instr.isEnvDependent = isEnvDependent(instr.consequent) || isEnvDependent(instr.alternate);
            return instr;
        }
    ]
]);
exports.propertySetter = propertySetter;
/**
 * Checks whether the evaluation of the given control item depends on the current environment.
 * The item is also considered environment dependent if its evaluation introduces
 * environment dependent items
 * @param item The control item to be checked
 * @return `true` if the item is environment depedent, else `false`.
 */
function isEnvDependent(item) {
    var _a, _b;
    if (item === null || item === undefined) {
        return false;
    }
    // If result is already calculated, return it
    if (item.isEnvDependent !== undefined) {
        return item.isEnvDependent;
    }
    let setter;
    if ((0, ast_helper_1.isNode)(item)) {
        setter = propertySetter.get(item.type);
    }
    else if ((0, exports.isInstr)(item)) {
        setter = propertySetter.get(item.instrType);
    }
    if (setter) {
        return (_b = (_a = setter(item)) === null || _a === void 0 ? void 0 : _a.isEnvDependent) !== null && _b !== void 0 ? _b : false;
    }
    return false;
}
// function isInstr(item: ControlItem): item is Instr & { isEnvDependent?: boolean } {
//   return (item as Instr).instrType !== undefined;
// }
// export const envChanging = (command: ControlItem): boolean => {
//   if (isNode(command)) {
//     const type = command.type
//     return (
//       type === 'Program' ||
//       type === 'BlockStatement' ||
//       type === 'ArrowFunctionExpression' ||
//       (type === 'ExpressionStatement' && command.expression.type === 'ArrowFunctionExpression')
//     )
//   } else {
//     const type = command.instrType
//     return (
//       type === InstrType.ENVIRONMENT ||
//       type === InstrType.ARRAY_LITERAL ||
//       type === InstrType.ASSIGNMENT ||
//       type === InstrType.ARRAY_ASSIGNMENT ||
//       (type === InstrType.APPLICATION && (command as AppInstr).numOfArgs > 0)
//     )
//   }
// }
const envChanging = (command) => {
    if ((0, ast_helper_1.isNode)(command)) {
        const type = command.type;
        return (type === 'Program' ||
            type === 'BlockStatement' ||
            type === 'ArrowFunctionExpression' ||
            (type === 'ExpressionStatement' && command.expression.type === 'ArrowFunctionExpression'));
    }
    else if ((0, exports.isInstr)(command)) {
        const type = command.instrType;
        return (false);
    }
    else {
        return false;
    }
};
exports.envChanging = envChanging;
function declareFunctionsAndVariables(context, node, environment) {
    for (const statement of node.body) {
        switch (statement.type) {
            case 'VariableDeclaration':
                declareVariables(context, statement, environment);
                break;
            case 'FunctionDeclaration':
                // FunctionDeclaration is always of type constant
                declareIdentifier(context, statement.id.name, statement, environment, true);
                break;
        }
    }
}
function declareVariables(context, node, environment) {
    for (const declaration of node.declarations) {
        // Retrieve declaration type from node
        const constant = node.kind === 'const';
        declareIdentifier(context, declaration.id.name, node, environment, constant);
    }
}
function declareIdentifier(context, name, node, environment, constant = false) {
    if (environment.head.hasOwnProperty(name)) {
        const descriptors = Object.getOwnPropertyDescriptors(environment.head);
        // return handleRuntimeError(
        //   context,
        //   new errors.VariableRedeclaration(node, name, descriptors[name].writable)
        // )
    }
    //environment.head[name] = constant ? UNASSIGNED_CONST : UNASSIGNED_LET
    environment.head[name] = 'declaration';
    return environment;
}
const handleSequence = (seq) => {
    const result = [];
    let valueProduced = false;
    for (const command of seq) {
        //if (!isImportDeclaration(command)) {
        if ((0, exports.valueProducing)(command)) {
            // Value producing statements have an extra pop instruction
            if (valueProduced) {
                result.push(instr.popInstr(command));
            }
            else {
                valueProduced = true;
            }
        }
        result.push(command);
        //}
    }
    // Push statements in reverse order
    return result.reverse();
};
exports.handleSequence = handleSequence;
const valueProducing = (command) => {
    const type = command.type;
    return (type !== 'VariableDeclaration' &&
        type !== 'FunctionDeclaration' &&
        type !== 'ContinueStatement' &&
        type !== 'BreakStatement' &&
        type !== 'DebuggerStatement' &&
        (type !== 'BlockStatement' || command.body.some(exports.valueProducing)));
};
exports.valueProducing = valueProducing;
function defineVariable(context, name, value, constant = false, node) {
    const environment = (0, environment_1.currentEnvironment)(context);
    if (environment.head[name] !== 'declaration') {
        // error
        //return handleRuntimeError(context, new errors.VariableRedeclaration(node, name, !constant))
    }
    if (constant && value instanceof closure_1.Closure) {
        value.declaredName = name;
    }
    Object.defineProperty(environment.head, name, {
        value,
        writable: !constant,
        enumerable: true
    });
    return environment;
}
const getVariable = (context, name, node) => {
    let environment = (0, environment_1.currentEnvironment)(context);
    while (environment) {
        if (environment.head.hasOwnProperty(name)) {
            if (environment.head[name] === 'declaration') {
                //return handleRuntimeError(context, new errors.UnassignedVariable(name, node))
            }
            else {
                return environment.head[name];
            }
        }
        else {
            environment = environment.tail;
        }
    }
    //return handleRuntimeError(context, new errors.UndefinedVariable(name, node))
};
exports.getVariable = getVariable;
const checkStackOverFlow = (context, control) => {
    // todo
};
exports.checkStackOverFlow = checkStackOverFlow;
const checkNumberOfArguments = (command, context, callee, args, exp) => {
    if (callee instanceof closure_1.Closure) {
        // User-defined or Pre-defined functions
        const params = callee.node.params;
        // console.info("params: ", params);
        // console.info("args: ", args);
        //const hasVarArgs = params[params.length - 1]?.type === 'RestElement'
        if (params.length > args.length) {
            (0, exports.handleRuntimeError)(context, new errors_1.MissingRequiredPositionalError(command, callee.declaredName, params, args));
        }
        else if (params.length !== args.length) {
            (0, exports.handleRuntimeError)(context, new errors_1.TooManyPositionalArgumentsError(command, callee.declaredName, params, args));
        }
        //}
        // if (hasVarArgs ? params.length - 1 > args.length : params.length !== args.length) {
        //   // error
        //   // return handleRuntimeError(
        //   //   context,
        //   //   new errors.InvalidNumberOfArguments(
        //   //     exp,
        //   //     hasVarArgs ? params.length - 1 : params.length,
        //   //     args.length,
        //   //     hasVarArgs
        //   //   )
        //   // )
        // }
    }
    else {
        // Pre-built functions
        const hasVarArgs = callee.minArgsNeeded != undefined;
        if (hasVarArgs ? callee.minArgsNeeded > args.length : callee.length !== args.length) {
            // error
            // return handleRuntimeError(
            //   context,
            //   new errors.InvalidNumberOfArguments(
            //     exp,
            //     hasVarArgs ? callee.minArgsNeeded : callee.length,
            //     args.length,
            //     hasVarArgs
            //   )
            // )
        }
    }
    return undefined;
};
exports.checkNumberOfArguments = checkNumberOfArguments;
const isInstr = (command) => {
    return command.instrType !== undefined;
};
exports.isInstr = isInstr;
const isSimpleFunction = (node) => {
    if (node.body.type !== 'BlockStatement' && node.body.type !== 'StatementSequence') {
        return true;
    }
    else {
        const block = node.body;
        return block.body.length === 1 && block.body[0].type === 'ReturnStatement';
    }
};
exports.isSimpleFunction = isSimpleFunction;
const reduceConditional = (node) => {
    return [instr.branchInstr(node.consequent, node.alternate, node), node.test];
};
exports.reduceConditional = reduceConditional;
const handleRuntimeError = (context, error) => {
    context.errors.push(error);
    console.error(error.explain());
    console.error(error.elaborate());
    //console.log("Location:", `Line ${e.location.start.line}, Column ${e.location.start.column}`);
    throw error;
};
exports.handleRuntimeError = handleRuntimeError;
function pythonMod(a, b) {
    const mod = a % b;
    if ((mod >= 0 && b > 0) || (mod <= 0 && b < 0)) {
        return mod;
    }
    else {
        return mod + b;
    }
}
