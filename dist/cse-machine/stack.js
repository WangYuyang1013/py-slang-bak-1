"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stack = void 0;
class Stack {
    constructor() {
        // Bottom of the array is at index 0
        this.storage = [];
    }
    push(...items) {
        for (const item of items) {
            this.storage.push(item);
        }
    }
    pop() {
        return this.storage.pop();
    }
    peek() {
        if (this.isEmpty()) {
            return undefined;
        }
        return this.storage[this.size() - 1];
    }
    size() {
        return this.storage.length;
    }
    isEmpty() {
        return this.size() == 0;
    }
    getStack() {
        // return a copy of the stack's contents
        return [...this.storage];
    }
    some(predicate) {
        return this.storage.some(predicate);
    }
    // required for first-class continuations,
    // which directly mutate this stack globally.
    setTo(otherStack) {
        this.storage = otherStack.storage;
    }
}
exports.Stack = Stack;
