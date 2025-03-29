"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pushEnvironment = exports.popEnvironment = exports.currentEnvironment = exports.handleArrayCreation = exports.isRestElement = exports.createBlockEnvironment = exports.createProgramEnvironment = exports.createSimpleEnvironment = exports.createEnvironment = exports.uniqueId = void 0;
const heap_1 = require("./heap");
const uniqueId = (context) => {
    return `${context.runtime.objectCount++}`;
};
exports.uniqueId = uniqueId;
const createEnvironment = (context, closure, args, callExpression) => {
    const environment = {
        // TODO: name
        name: '',
        tail: closure.environment,
        head: {},
        heap: new heap_1.Heap(),
        id: (0, exports.uniqueId)(context),
        callExpression: Object.assign({}, callExpression)
    };
    // console.info('closure.node.params:', closure.node.params);
    // console.info('Number of params:', closure.node.params.length);
    closure.node.params.forEach((param, index) => {
        if ((0, exports.isRestElement)(param)) {
            const array = args.slice(index);
            (0, exports.handleArrayCreation)(context, array, environment);
            environment.head[param.argument.name] = array;
        }
        else {
            environment.head[param.name] = args[index];
        }
    });
    return environment;
};
exports.createEnvironment = createEnvironment;
const createSimpleEnvironment = (context, name, tail = null) => {
    return {
        id: (0, exports.uniqueId)(context),
        name,
        tail,
        head: {},
        heap: new heap_1.Heap(),
        // callExpression 和 thisContext 可选，根据需要传递
    };
};
exports.createSimpleEnvironment = createSimpleEnvironment;
const createProgramEnvironment = (context, isPrelude) => {
    return (0, exports.createSimpleEnvironment)(context, isPrelude ? 'prelude' : 'programEnvironment');
};
exports.createProgramEnvironment = createProgramEnvironment;
const createBlockEnvironment = (context, name = 'blockEnvironment') => {
    return {
        name,
        tail: (0, exports.currentEnvironment)(context),
        head: {},
        heap: new heap_1.Heap(),
        id: (0, exports.uniqueId)(context)
    };
};
exports.createBlockEnvironment = createBlockEnvironment;
const isRestElement = (node) => {
    return node.type === 'RestElement';
};
exports.isRestElement = isRestElement;
const handleArrayCreation = (context, array, envOverride) => {
    const environment = envOverride !== null && envOverride !== void 0 ? envOverride : (0, exports.currentEnvironment)(context);
    Object.defineProperties(array, {
        id: { value: (0, exports.uniqueId)(context) },
        environment: { value: environment, writable: true }
    });
    environment.heap.add(array); // 假设 heap.add 已定义
};
exports.handleArrayCreation = handleArrayCreation;
const currentEnvironment = (context) => {
    return context.runtime.environments[0];
};
exports.currentEnvironment = currentEnvironment;
const popEnvironment = (context) => context.runtime.environments.shift();
exports.popEnvironment = popEnvironment;
const pushEnvironment = (context, environment) => {
    context.runtime.environments.unshift(environment);
    context.runtime.environmentTree.insert(environment);
};
exports.pushEnvironment = pushEnvironment;
