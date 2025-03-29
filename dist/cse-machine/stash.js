"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stash = void 0;
const stack_1 = require("./stack");
class Stash extends stack_1.Stack {
    constructor() {
        super();
    }
    copy() {
        const newStash = new Stash();
        const stackCopy = super.getStack();
        newStash.push(...stackCopy);
        return newStash;
    }
}
exports.Stash = Stash;
