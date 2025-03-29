"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvTreeNode = exports.EnvTree = exports.Context = void 0;
const stash_1 = require("./stash");
const control_1 = require("./control");
const heap_1 = require("./heap");
class Context {
    //public nodes: ;
    constructor(program, context) {
        //public environment: Environment;
        this.errors = [];
        this.createGlobalEnvironment = () => ({
            tail: null,
            name: 'global',
            head: {},
            heap: new heap_1.Heap(),
            id: '-1'
        });
        this.createEmptyRuntime = () => ({
            break: false,
            debuggerOn: true,
            isRunning: false,
            environmentTree: new EnvTree(),
            environments: [],
            value: undefined,
            nodes: [],
            control: null,
            stash: null,
            objectCount: 0,
            envSteps: -1,
            envStepsTotal: 0,
            breakpointSteps: [],
            changepointSteps: []
        });
        this.control = new control_1.Control(program);
        this.stash = new stash_1.Stash();
        this.runtime = this.createEmptyRuntime();
        //this.environment = createProgramEnvironment(context || this, false);
        if (this.runtime.environments.length === 0) {
            const globalEnvironment = this.createGlobalEnvironment();
            this.runtime.environments.push(globalEnvironment);
            this.runtime.environmentTree.insert(globalEnvironment);
        }
    }
    reset(program) {
        this.control = new control_1.Control(program);
        this.stash = new stash_1.Stash();
        //this.environment = createProgramEnvironment(this, false);
        this.errors = [];
    }
    copy() {
        const newContext = new Context();
        newContext.control = this.control.copy();
        newContext.stash = this.stash.copy();
        //newContext.environments = this.copyEnvironment(this.environments);
        return newContext;
    }
    copyEnvironment(env) {
        const newTail = env.tail ? this.copyEnvironment(env.tail) : null;
        const newEnv = {
            id: env.id,
            name: env.name,
            tail: newTail,
            head: Object.assign({}, env.head),
            heap: new heap_1.Heap(),
            callExpression: env.callExpression,
            thisContext: env.thisContext
        };
        return newEnv;
    }
}
exports.Context = Context;
class EnvTree {
    constructor() {
        this._root = null;
        this.map = new Map();
    }
    get root() {
        return this._root;
    }
    insert(environment) {
        const tailEnvironment = environment.tail;
        if (tailEnvironment === null) {
            if (this._root === null) {
                this._root = new EnvTreeNode(environment, null);
                this.map.set(environment, this._root);
            }
        }
        else {
            const parentNode = this.map.get(tailEnvironment);
            if (parentNode) {
                const childNode = new EnvTreeNode(environment, parentNode);
                parentNode.addChild(childNode);
                this.map.set(environment, childNode);
            }
        }
    }
    getTreeNode(environment) {
        return this.map.get(environment);
    }
}
exports.EnvTree = EnvTree;
class EnvTreeNode {
    constructor(environment, parent) {
        this.environment = environment;
        this.parent = parent;
        this._children = [];
    }
    get children() {
        return this._children;
    }
    resetChildren(newChildren) {
        this.clearChildren();
        this.addChildren(newChildren);
        newChildren.forEach(c => (c.parent = this));
    }
    clearChildren() {
        this._children = [];
    }
    addChildren(newChildren) {
        this._children.push(...newChildren);
    }
    addChild(newChild) {
        this._children.push(newChild);
        return newChild;
    }
}
exports.EnvTreeNode = EnvTreeNode;
