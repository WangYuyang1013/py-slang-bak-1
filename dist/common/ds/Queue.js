"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Queue = void 0;
/**
 * A stack-based queue implementation.
 * `push` and `pop` run in amortized constant time.
 */
class Queue {
    constructor() {
        /** The output stack. */
        this.__s1 = [];
        /** The input stack. */
        this.__s2 = [];
    }
    /**
     * Adds an item to the queue.
     * @param item The item to be added to the queue.
     */
    push(item) {
        this.__s2.push(item);
    }
    /**
     * Removes an item from the queue.
     * @returns The item removed from the queue.
     * @throws If the queue is empty.
     */
    pop() {
        if (this.__s1.length === 0) {
            if (this.__s2.length === 0)
                throw new Error("queue is empty");
            let temp = this.__s1;
            this.__s1 = this.__s2.reverse();
            this.__s2 = temp;
        }
        return this.__s1.pop(); // as the length is nonzero
    }
    /**
     * The length of the queue.
     */
    get length() {
        return this.__s1.length + this.__s2.length;
    }
    /**
     * Makes a copy of the queue.
     * @returns A copy of the queue.
     */
    clone() {
        const newQueue = new Queue();
        newQueue.__s1 = [...this.__s1];
        newQueue.__s2 = [...this.__s2];
        return newQueue;
    }
}
exports.Queue = Queue;
