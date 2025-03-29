"use strict";
/**
 * This interpreter implements an explicit-control evaluator.
 *
 * Heavily adapted from https://github.com/source-academy/JSpike/
 */
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
exports.CSEResultPromise = CSEResultPromise;
exports.evaluate = evaluate;
exports.generateCSEMachineStateStream = generateCSEMachineStateStream;
const control_1 = require("./control");
const stash_1 = require("./stash");
const environment_1 = require("./environment");
const ast_helper_1 = require("./ast-helper");
const utils_1 = require("./utils");
const types_1 = require("./types");
const instr = __importStar(require("./instrCreator"));
const closure_1 = require("./closure");
const operators_1 = require("./operators");
const instrCreator_1 = require("./instrCreator");
const error = __importStar(require("../errors/errors"));
const types_2 = require("../types");
const stdlib_1 = require("../stdlib");
const error_1 = require("./error");
/**
 * Function that returns the appropriate Promise<Result> given the output of CSE machine evaluating, depending
 * on whether the program is finished evaluating, ran into a breakpoint or ran into an error.
 * @param context The context of the program.
 * @param value The value of CSE machine evaluating the program.
 * @returns The corresponding promise.
 */
function CSEResultPromise(context, value) {
    return new Promise((resolve, reject) => {
        if (value instanceof types_2.CSEBreak) {
            resolve({ status: 'suspended-cse-eval', context });
        }
        else if (value instanceof error_1.CseError) {
            resolve({ status: 'error' });
        }
        else {
            const representation = new types_2.Representation(value);
            resolve({ status: 'finished', context, value, representation });
        }
    });
}
/**
 * Function to be called when a program is to be interpreted using
 * the explicit control evaluator.
 *
 * @param program The program to evaluate.
 * @param context The context to evaluate the program in.
 * @param options Evaluation options.
 * @returns The result of running the CSE machine.
 */
function evaluate(program, context, options = {}) {
    try {
        // TODO: is undefined variables check necessary for Python?
        // checkProgramForUndefinedVariables(program, context)
    }
    catch (error) {
        context.errors.push(new error_1.CseError(error.message));
        return { type: 'error', message: error.message };
    }
    // TODO: should call transformer like in js-slang
    // seq.transform(program)
    try {
        context.runtime.isRunning = true;
        context.control = new control_1.Control(program);
        context.stash = new stash_1.Stash();
        return runCSEMachine(context, context.control, context.stash, options.envSteps, options.stepLimit, options.isPrelude);
    }
    catch (error) {
        context.errors.push(new error_1.CseError(error.message));
        return { type: 'error', message: error.message };
    }
    finally {
        context.runtime.isRunning = false;
    }
}
/**
 * The primary runner/loop of the explicit control evaluator.
 *
 * @param context The context to evaluate the program in.
 * @param control Points to the current Control stack.
 * @param stash Points to the current Stash.
 * @param envSteps Number of environment steps to run.
 * @param stepLimit Maximum number of steps to execute.
 * @param isPrelude Whether the program is the prelude.
 * @returns The top value of the stash after execution.
 */
function runCSEMachine(context, control, stash, envSteps, stepLimit, isPrelude = false) {
    const eceState = generateCSEMachineStateStream(context, control, stash, envSteps, stepLimit, isPrelude);
    // Execute the generator until it completes
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const value of eceState) {
    }
    // Return the value at the top of the storage as the result
    const result = stash.peek();
    return result !== undefined ? result : { type: 'undefined' };
}
/**
 * Generator function that yields the state of the CSE Machine at each step.
 *
 * @param context The context of the program.
 * @param control The control stack.
 * @param stash The stash storage.
 * @param envSteps Number of environment steps to run.
 * @param stepLimit Maximum number of steps to execute.
 * @param isPrelude Whether the program is the prelude.
 * @yields The current state of the stash, control stack, and step count.
 */
function* generateCSEMachineStateStream(context, control, stash, envSteps, stepLimit, isPrelude = false) {
    // steps: number of steps completed
    let steps = 0;
    let command = control.peek();
    // Push first node to be evaluated into context.
    // The typeguard is there to guarantee that we are pushing a node (which should always be the case)
    if (command && (0, ast_helper_1.isNode)(command)) {
        context.runtime.nodes.unshift(command);
    }
    while (command) {
        // For local debug only
        // console.info('next command to be evaluated');
        // console.info(command);
        // Return to capture a snapshot of the control and stash after the target step count is reached
        if (!isPrelude && steps === envSteps) {
            yield { stash, control, steps };
            return;
        }
        // Step limit reached, stop further evaluation
        if (!isPrelude && steps === stepLimit) {
            break;
        }
        if (!isPrelude && (0, utils_1.envChanging)(command)) {
            // command is evaluated on the next step
            // Hence, next step will change the environment
            context.runtime.changepointSteps.push(steps + 1);
        }
        control.pop();
        if ((0, ast_helper_1.isNode)(command)) {
            context.runtime.nodes.shift();
            context.runtime.nodes.unshift(command);
            //checkEditorBreakpoints(context, command)
            cmdEvaluators[command.type](command, context, control, stash, isPrelude);
            if (context.runtime.break && context.runtime.debuggerOn) {
                // TODO
                // We can put this under isNode since context.runtime.break
                // will only be updated after a debugger statement and so we will
                // run into a node immediately after.
                // With the new evaluator, we don't return a break
                // return new CSEBreak()
            }
        }
        else {
            // Command is an instruction
            cmdEvaluators[command.instrType](command, context, control, stash, isPrelude);
        }
        // Push undefined into the stack if both control and stash is empty
        if (control.isEmpty() && stash.isEmpty()) {
            //stash.push(undefined)
        }
        command = control.peek();
        steps += 1;
        if (!isPrelude) {
            context.runtime.envStepsTotal = steps;
        }
        // printEnvironmentVariables(context.runtime.environments);
        yield { stash, control, steps };
    }
}
function printEnvironmentVariables(environments) {
    console.info('----------------------------------------');
    environments.forEach(env => {
        console.info(`Env: ${env.name} (ID: ${env.id})`);
        const variables = env.head;
        const variableNames = Object.keys(variables);
        if (variableNames.length > 0) {
            variableNames.forEach(varName => {
                const descriptor = Object.getOwnPropertyDescriptor(env.head, varName);
                if (descriptor) {
                    const value = descriptor.value.value;
                    console.info('value: ', value);
                    const valueStr = (typeof value === 'object' && value !== null)
                        ? JSON.stringify(value, null, 2)
                        : String(value);
                    console.info(`  ${varName}: ${valueStr}`);
                }
                else {
                    console.info(`  ${varName}: None`);
                }
            });
        }
        else {
            console.info('  no defined variables');
        }
    });
}
const cmdEvaluators = {
    /**
     * AST Nodes
     */
    Program: function (command, context, control, stash, isPrelude) {
        // Clean up non-global, non-program, and non-preparation environments
        while ((0, environment_1.currentEnvironment)(context).name !== 'global' &&
            (0, environment_1.currentEnvironment)(context).name !== 'programEnvironment' &&
            (0, environment_1.currentEnvironment)(context).name !== 'prelude') {
            (0, environment_1.popEnvironment)(context);
        }
        if ((0, ast_helper_1.hasDeclarations)(command)) {
            if ((0, environment_1.currentEnvironment)(context).name != 'programEnvironment') {
                const programEnv = (0, environment_1.createProgramEnvironment)(context, isPrelude);
                (0, environment_1.pushEnvironment)(context, programEnv);
            }
            const environment = (0, environment_1.currentEnvironment)(context);
            (0, utils_1.declareFunctionsAndVariables)(context, command, environment);
        }
        if (command.body.length === 1) {
            // If the program contains only a single statement, execute it immediately
            const next = command.body[0];
            cmdEvaluators[next.type](next, context, control, stash, isPrelude);
        }
        else {
            // Push the block body as a sequence of statements onto the control stack
            const seq = (0, ast_helper_1.statementSequence)(command.body, command.loc);
            control.push(seq);
        }
    },
    BlockStatement: function (command, context, control) {
        const next = control.peek();
        // for some of the block statements, such as if, for,
        // no need to create a new environment
        if (!command.skipEnv) {
            // If environment instructions need to be pushed
            if (next &&
                !((0, utils_1.isInstr)(next) && next.instrType === types_1.InstrType.ENVIRONMENT) &&
                !control.canAvoidEnvInstr()) {
                control.push(instr.envInstr((0, environment_1.currentEnvironment)(context), command));
            }
            // create new block environment (for function)
            const environment = (0, environment_1.createBlockEnvironment)(context, 'blockEnvironment');
            (0, utils_1.declareFunctionsAndVariables)(context, command, environment);
            (0, environment_1.pushEnvironment)(context, environment);
        }
        // Push the block body onto the control stack as a sequence of statements
        const seq = (0, ast_helper_1.statementSequence)(command.body, command.loc);
        control.push(seq);
    },
    StatementSequence: function (command, context, control, stash, isPrelude) {
        if (command.body.length === 1) {
            // If the program contains only a single statement, execute it immediately
            const next = command.body[0];
            cmdEvaluators[next.type](next, context, control, stash, isPrelude);
        }
        else {
            // Split and push individual nodes
            control.push(...(0, utils_1.handleSequence)(command.body));
        }
    },
    // WhileStatement: function (
    //   command: es.WhileStatement,
    //   context: Context,
    //   control: Control,
    //   stash: Stash
    // ) {
    //   if (hasBreakStatement(command.body as es.BlockStatement)) {
    //     control.push(instr.breakMarkerInstr(command));
    //   }
    //   control.push(instr.whileInstr(command.test, command.body, command));
    //   control.push(command.test);
    //   control.push(ast.identifier('undefined', command.loc)); // 如果没有循环执行，返回 undefined
    // },
    // ForStatement: function (
    //   command: es.ForStatement,
    //   context: Context,
    //   control: Control
    // ) {
    //   const init = command.init!;
    //   const test = command.test!;
    //   const update = command.update!;
    //   if (init.type === 'VariableDeclaration' && init.kind === 'let') {
    //     const id = init.declarations[0].id as es.Identifier;
    //     const valueExpression = init.declarations[0].init!;
    //     control.push(
    //       ast.blockStatement(
    //         [
    //           init,
    //           ast.forStatement(
    //             ast.assignmentExpression(id, valueExpression, command.loc),
    //             test,
    //             update,
    //             ast.blockStatement(
    //               [
    //                 ast.variableDeclaration(
    //                   [
    //                     ast.variableDeclarator(
    //                       ast.identifier(`_copy_of_${id.name}`, command.loc),
    //                       ast.identifier(id.name, command.loc),
    //                       command.loc
    //                     )
    //                   ],
    //                   command.loc
    //                 ),
    //                 ast.blockStatement(
    //                   [
    //                     ast.variableDeclaration(
    //                       [
    //                         ast.variableDeclarator(
    //                           ast.identifier(id.name, command.loc),
    //                           ast.identifier(`_copy_of_${id.name}`, command.loc),
    //                           command.loc
    //                         )
    //                       ],
    //                       command.loc
    //                     ),
    //                     command.body
    //                   ],
    //                   command.loc
    //                 )
    //               ],
    //               command.loc
    //             ),
    //             command.loc
    //           )
    //         ],
    //         command.loc
    //       )
    //     );
    //   } else {
    //     if (hasBreakStatement(command.body as es.BlockStatement)) {
    //       control.push(instr.breakMarkerInstr(command));
    //     }
    //     control.push(instr.forInstr(init, test, update, command.body, command));
    //     control.push(test);
    //     control.push(instr.popInstr(command)); // Pop value from init assignment
    //     control.push(init);
    //     control.push(ast.identifier('undefined', command.loc)); // Return undefined if there is no loop execution
    //   }
    // },
    IfStatement: function (command, //es.IfStatement,
    context, control, stash) {
        control.push(...(0, utils_1.reduceConditional)(command));
    },
    ExpressionStatement: function (command, //es.ExpressionStatement,
    context, control, stash, isPrelude) {
        cmdEvaluators[command.expression.type](command.expression, context, control, stash, isPrelude);
    },
    // DebuggerStatement: function (
    //   command: es.DebuggerStatement,
    //   context: Context
    // ) {
    //   context.runtime.break = true;
    // },
    VariableDeclaration: function (command, context, control) {
        const declaration = command.declarations[0];
        const id = declaration.id;
        const init = declaration.init;
        control.push(instr.popInstr(command));
        control.push(instr.assmtInstr(id.name, command.kind === 'const', true, command));
        control.push(init);
    },
    FunctionDeclaration: function (command, //es.FunctionDeclaration,
    context, control) {
        const lambdaExpression = (0, ast_helper_1.blockArrowFunction)(command.params, command.body, command.loc);
        const lambdaDeclaration = (0, ast_helper_1.constantDeclaration)(command.id.name, lambdaExpression, command.loc);
        control.push(lambdaDeclaration);
    },
    ReturnStatement: function (command, //as es.ReturnStatement,
    context, control) {
        const next = control.peek();
        if (next && (0, utils_1.isInstr)(next) && next.instrType === types_1.InstrType.MARKER) {
            control.pop();
        }
        else {
            control.push(instr.resetInstr(command));
        }
        if (command.argument) {
            control.push(command.argument);
        }
    },
    // ContinueStatement: function (
    //   command: es.ContinueStatement,
    //   context: Context,
    //   control: Control,
    //   stash: Stash
    // ) {
    //   control.push(instr.contInstr(command));
    // },
    // BreakStatement: function (
    //   command: es.BreakStatement,
    //   context: Context,
    //   control: Control,
    //   stash: Stash
    // ) {
    //   control.push(instr.breakInstr(command));
    // },
    // ImportDeclaration: function () {
    //   
    // },
    /**
     * Expressions
     */
    Literal: function (command, //es.Literal
    context, control, stash) {
        const literalValue = command.value;
        const bigintValue = command.bigint;
        const complexValue = command.complex;
        if (literalValue !== undefined) {
            let value;
            if (typeof literalValue === 'number') {
                value = { type: 'number', value: literalValue };
            }
            else if (typeof literalValue === 'string') {
                value = { type: 'string', value: literalValue };
            }
            else if (typeof literalValue === 'boolean') {
                value = { type: 'bool', value: literalValue };
                //value = literalValue;
            }
            else {
                //handleRuntimeError(context, new CseError('Unsupported literal type'));
                return;
            }
            stash.push(value);
        }
        else if (bigintValue !== undefined) {
            let fixedBigintValue = bigintValue.toString().replace(/_/g, "");
            let value;
            try {
                value = { type: 'bigint', value: BigInt(fixedBigintValue) };
            }
            catch (e) {
                //handleRuntimeError(context, new CseError('Invalid BigInt literal'));
                return;
            }
            stash.push(value);
        }
        else if (complexValue !== undefined) {
            let value;
            let pyComplexNumber = new types_2.PyComplexNumber(complexValue.real, complexValue.imag);
            try {
                value = { type: 'complex', value: pyComplexNumber };
            }
            catch (e) {
                //handleRuntimeError(context, new CseError('Invalid BigInt literal'));
                return;
            }
            stash.push(value);
        }
        else {
            // TODO
            // Error
        }
    },
    NoneType: function (command, //es.Literal
    context, control, stash) {
        stash.push({ type: 'NoneType', value: undefined });
    },
    // AssignmentExpression: function (
    //   command: es.AssignmentExpression,
    //   context: Context,
    //   control: Control
    // ) {
    //   if (command.left.type === 'MemberExpression') {
    //     control.push(instr.arrAssmtInstr(command));
    //     control.push(command.right);
    //     control.push(command.left.property);
    //     control.push(command.left.object);
    //   } else if (command.left.type === 'Identifier') {
    //     const id = command.left;
    //     control.push(instr.assmtInstr(id.name, false, false, command));
    //     control.push(command.right);
    //   }
    // },
    // ArrayExpression: function (
    //   command: es.ArrayExpression,
    //   context: Context,
    //   control: Control
    // ) {
    //   const elems = command.elements as es.Expression[];
    //   reverse(elems);
    //   const len = elems.length;
    //   control.push(instr.arrLitInstr(len, command));
    //   for (const elem of elems) {
    //     control.push(elem);
    //   }
    // },
    // MemberExpression: function (
    //   command: es.MemberExpression,
    //   context: Context,
    //   control: Control,
    //   stash: Stash
    // ) {
    //   control.push(instr.arrAccInstr(command));
    //   control.push(command.property);
    //   control.push(command.object);
    // },
    ConditionalExpression: function (command, //es.ConditionalExpression,
    context, control, stash) {
        control.push(...(0, utils_1.reduceConditional)(command));
    },
    Identifier: function (command, //es.Identifier,
    context, control, stash) {
        if (stdlib_1.builtInConstants.has(command.name)) {
            const builtinCons = stdlib_1.builtInConstants.get(command.name);
            try {
                stash.push(builtinCons);
                return;
            }
            catch (error) {
                // Error
                if (error instanceof Error) {
                    throw new Error(error.message);
                }
                else {
                    throw new Error();
                }
                // if (error instanceof RuntimeSourceError) {
                //   throw error;
                // } else {
                //   throw new RuntimeSourceError(`Error in builtin function ${funcName}: ${error}`);
                // }
            }
        }
        else {
            stash.push((0, utils_1.getVariable)(context, command.name, command));
        }
    },
    UnaryExpression: function (command, //es.UnaryExpression,
    context, control) {
        control.push(instr.unOpInstr(command.operator, command));
        control.push(command.argument);
    },
    BinaryExpression: function (command, //es.BinaryExpression,
    context, control) {
        // currently for if statement
        control.push(instr.binOpInstr(command.operator, command));
        control.push(command.right);
        control.push(command.left);
    },
    LogicalExpression: function (command, //es.LogicalExpression,
    context, control) {
        if (command.operator === '&&') {
            control.push((0, instrCreator_1.conditionalExpression)(command.left, command.right, (0, ast_helper_1.literal)(false), command.loc));
        }
        else {
            control.push((0, instrCreator_1.conditionalExpression)(command.left, (0, ast_helper_1.literal)(true), command.right, command.loc));
        }
    },
    ArrowFunctionExpression: function (command, //es.ArrowFunctionExpression,
    context, control, stash, isPrelude) {
        const closure = closure_1.Closure.makeFromArrowFunction(command, (0, environment_1.currentEnvironment)(context), context, true, isPrelude);
        stash.push(closure);
    },
    CallExpression: function (command, //es.CallExpression,
    context, control) {
        // add
        if ((0, utils_1.isIdentifier)(command.callee)) {
            let name = command.callee.name;
            if (name === '__py_adder' || name === '__py_minuser' ||
                name === '__py_multiplier' || name === '__py_divider' ||
                name === '__py_modder' || name === '__py_floorer' ||
                name === '__py_powerer') {
                control.push(instr.binOpInstr(command.callee, command));
                control.push(command.arguments[1]);
                control.push(command.arguments[0]);
                return;
            }
        }
        control.push(instr.appInstr(command.arguments.length, command));
        for (let index = command.arguments.length - 1; index >= 0; index--) {
            control.push(command.arguments[index]);
        }
        control.push(command.callee);
    },
    // /**
    //  * Instructions
    //  */
    [types_1.InstrType.RESET]: function (command, //Instr,
    context, control, stash) {
        const cmdNext = control.pop();
        if (cmdNext && ((0, ast_helper_1.isNode)(cmdNext) || cmdNext.instrType !== types_1.InstrType.MARKER)) {
            control.push(instr.resetInstr(command.srcNode));
        }
    },
    // [InstrType.WHILE]: function (
    //   command: WhileInstr,
    //   context: Context,
    //   control: Control,
    //   stash: Stash
    // ) {
    //   const test = stash.pop();
    //   const error = rttc.checkIfStatement(command.srcNode, test, context.chapter);
    //   if (error) {
    //     handleRuntimeError(context, error);
    //   }
    //   if (test) {
    //     control.push(command);
    //     control.push(command.test);
    //     if (hasContinueStatement(command.body as es.BlockStatement)) {
    //       control.push(instr.contMarkerInstr(command.srcNode));
    //     }
    //     if (!valueProducing(command.body)) {
    //       control.push(ast.identifier('undefined', command.body.loc));
    //     }
    //     control.push(command.body);
    //     control.push(instr.popInstr(command.srcNode)); // Pop previous body value
    //   }
    // },
    // [InstrType.FOR]: function (
    //   command: ForInstr,
    //   context: Context,
    //   control: Control,
    //   stash: Stash
    // ) {
    //   const test = stash.pop();
    //   const error = rttc.checkIfStatement(command.srcNode, test, context.chapter);
    //   if (error) {
    //     handleRuntimeError(context, error);
    //   }
    //   if (test) {
    //     control.push(command);
    //     control.push(command.test);
    //     control.push(instr.popInstr(command.srcNode)); // Pop value from update
    //     control.push(command.update);
    //     if (hasContinueStatement(command.body as es.BlockStatement)) {
    //       control.push(instr.contMarkerInstr(command.srcNode));
    //     }
    //     if (!valueProducing(command.body)) {
    //       control.push(ast.identifier('undefined', command.body.loc));
    //     }
    //     control.push(command.body);
    //     control.push(instr.popInstr(command.srcNode)); // Pop previous body value
    //   }
    // },
    [types_1.InstrType.ASSIGNMENT]: function (command, //AssmtInstr,
    context, control, stash) {
        if (command.declaration) {
            //if ()
            (0, utils_1.defineVariable)(context, command.symbol, stash.peek(), command.constant, command.srcNode);
        }
        else {
            // second time definition
            // setVariable(
            //   context,
            //   command.symbol,
            //   stash.peek(),
            //   command.srcNode as es.AssignmentExpression
            // );
        }
    },
    [types_1.InstrType.UNARY_OP]: function (command, //UnOpInstr,
    context, control, stash) {
        const argument = stash.pop();
        // const error = rttc.checkUnaryExpression(
        //   command.srcNode,
        //   command.symbol as es.UnaryOperator,
        //   argument,
        //   context.chapter
        // );
        // if (error) {
        //   handleRuntimeError(context, error);
        // }
        stash.push((0, operators_1.evaluateUnaryExpression)(command.symbol, argument));
    },
    [types_1.InstrType.BINARY_OP]: function (command, //BinOpInstr,
    context, control, stash) {
        const right = stash.pop();
        const left = stash.pop();
        // const error = rttc.checkBinaryExpression(
        //   command.srcNode,
        //   command.symbol as es.BinaryOperator,
        //   context.chapter,
        //   left,
        //   right
        // );
        // if (error) {
        //   handleRuntimeError(context, error);
        // }
        if ((left.type === 'string' && right.type !== 'string') ||
            (left.type !== 'string' && right.type === 'string')) {
            (0, utils_1.handleRuntimeError)(context, new error.TypeConcatenateError(command));
        }
        stash.push((0, operators_1.evaluateBinaryExpression)(context, command.symbol, left, right));
    },
    [types_1.InstrType.POP]: function (command, //Instr,
    context, control, stash) {
        stash.pop();
    },
    [types_1.InstrType.APPLICATION]: function (command, //AppInstr,
    context, control, stash) {
        var _a;
        (0, utils_1.checkStackOverFlow)(context, control);
        const args = [];
        for (let index = 0; index < command.numOfArgs; index++) {
            args.unshift(stash.pop());
        }
        const func = stash.pop();
        if (!(func instanceof closure_1.Closure)) {
            //error
            //handleRuntimeError(context, new errors.CallingNonFunctionValue(func, command.srcNode))
        }
        // continuation in python?
        // func instanceof Closure
        if (func instanceof closure_1.Closure) {
            // Check for number of arguments mismatch error
            (0, utils_1.checkNumberOfArguments)(command, context, func, args, command.srcNode);
            const next = control.peek();
            // Push ENVIRONMENT instruction if needed - if next control stack item
            // exists and is not an environment instruction, OR the control only contains
            // environment indepedent items
            if (next &&
                !((0, utils_1.isInstr)(next) && next.instrType === types_1.InstrType.ENVIRONMENT) &&
                !control.canAvoidEnvInstr()) {
                control.push(instr.envInstr((0, environment_1.currentEnvironment)(context), command.srcNode));
            }
            // Create environment for function parameters if the function isn't nullary.
            // Name the environment if the function call expression is not anonymous
            if (args.length > 0) {
                const environment = (0, environment_1.createEnvironment)(context, func, args, command.srcNode);
                (0, environment_1.pushEnvironment)(context, environment);
            }
            else {
                context.runtime.environments.unshift(func.environment);
            }
            // Handle special case if function is simple
            if ((0, utils_1.isSimpleFunction)(func.node)) {
                // Closures convert ArrowExpressionStatements to BlockStatements
                const block = func.node.body;
                const returnStatement = block.body[0];
                control.push((_a = returnStatement.argument) !== null && _a !== void 0 ? _a : (0, ast_helper_1.identifier)('undefined', returnStatement.loc));
            }
            else {
                if (control.peek()) {
                    // push marker if control not empty
                    control.push(instr.markerInstr(command.srcNode));
                }
                control.push(func.node.body);
                // console.info((func as Closure).node.body);
            }
            return;
        }
        // Value is a built-in function
        let function_name = command.srcNode.callee.name;
        if (stdlib_1.builtIns.has(function_name)) {
            const builtinFunc = stdlib_1.builtIns.get(function_name);
            try {
                stash.push(builtinFunc(args));
                return;
            }
            catch (error) {
                // Error
                if (error instanceof Error) {
                    throw new Error(error.message);
                }
                else {
                    throw new Error();
                }
                // if (error instanceof RuntimeSourceError) {
                //   throw error;
                // } else {
                //   throw new RuntimeSourceError(`Error in builtin function ${funcName}: ${error}`);
                // }
            }
        }
    },
    [types_1.InstrType.BRANCH]: function (command, //BranchInstr,
    context, control, stash) {
        const test = stash.pop();
        // const error = rttc.checkIfStatement(command.srcNode, test, context.chapter);
        // if (error) {
        //   handleRuntimeError(context, error);
        // }
        if (test.value) {
            if (!(0, utils_1.valueProducing)(command.consequent)) {
                control.push((0, ast_helper_1.identifier)('undefined', command.consequent.loc));
            }
            command.consequent.skipEnv = true;
            control.push(command.consequent);
        }
        else if (command.alternate) {
            if (!(0, utils_1.valueProducing)(command.alternate)) {
                control.push((0, ast_helper_1.identifier)('undefined', command.alternate.loc));
            }
            command.alternate.skipEnv = true;
            control.push(command.alternate);
        }
        else {
            control.push((0, ast_helper_1.identifier)('undefined', command.srcNode.loc));
        }
    },
    [types_1.InstrType.ENVIRONMENT]: function (command, //EnvInstr,
    context) {
        while ((0, environment_1.currentEnvironment)(context).id !== command.env.id) {
            (0, environment_1.popEnvironment)(context);
        }
    },
    // [InstrType.ARRAY_LITERAL]: function (
    //   command: ArrLitInstr,
    //   context: Context,
    //   control: Control,
    //   stash: Stash
    // ) {
    //   const arity = command.arity;
    //   const array: any[] = [];
    //   for (let i = 0; i < arity; ++i) {
    //     array.unshift(stash.pop());
    //   }
    //   handleArrayCreation(context, array);
    //   stash.push(array);
    // },
    // [InstrType.ARRAY_ACCESS]: function (
    //   command: Instr,
    //   context: Context,
    //   control: Control,
    //   stash: Stash
    // ) {
    //   const index = stash.pop();
    //   const array = stash.pop();
    //   stash.push(array[index]);
    // },
    // [InstrType.ARRAY_ASSIGNMENT]: function (
    //   command: Instr,
    //   context: Context,
    //   control: Control,
    //   stash: Stash
    // ) {
    //   const value = stash.pop();
    //   const index = stash.pop();
    //   const array = stash.pop();
    //   array[index] = value;
    //   stash.push(value);
    // },
    // [InstrType.CONTINUE]: function (
    //   command: Instr,
    //   context: Context,
    //   control: Control,
    //   stash: Stash
    // ) {
    //   const next = control.pop() as ControlItem;
    //   if (isInstr(next) && next.instrType === InstrType.CONTINUE_MARKER) {
    //   } else if (isInstr(next) && next.instrType === InstrType.ENVIRONMENT) {
    //     control.push(command);
    //     control.push(next); 
    //   } else {
    //     control.push(command);
    //   }
    // },
    // [InstrType.CONTINUE_MARKER]: function () {
    // },
    // [InstrType.BREAK]: function (
    //   command: Instr,
    //   context: Context,
    //   control: Control,
    //   stash: Stash
    // ) {
    //   const next = control.pop() as ControlItem;
    //   if (isInstr(next) && next.instrType === InstrType.BREAK_MARKER) {
    //   } else if (isInstr(next) && next.instrType === InstrType.ENVIRONMENT) {
    //     control.push(command);
    //     control.push(next);
    //   } else {
    //     control.push(command);
    //   }
    // },
    // [InstrType.BREAK_MARKER]: function () {
    // }
};
