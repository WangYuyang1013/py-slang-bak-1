"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Heap = void 0;
/**
 * The heap stores all objects in each environment.
 */
class Heap {
    constructor() {
        this.storage = null;
    }
    add(...items) {
        var _a;
        (_a = this.storage) !== null && _a !== void 0 ? _a : (this.storage = new Set());
        for (const item of items) {
            this.storage.add(item);
        }
    }
    /** Checks the existence of `item` in the heap. */
    contains(item) {
        var _a, _b;
        return (_b = (_a = this.storage) === null || _a === void 0 ? void 0 : _a.has(item)) !== null && _b !== void 0 ? _b : false;
    }
    /** Gets the number of items in the heap. */
    size() {
        var _a, _b;
        return (_b = (_a = this.storage) === null || _a === void 0 ? void 0 : _a.size) !== null && _b !== void 0 ? _b : 0;
    }
    /**
     * Removes `item` from current heap and adds it to `otherHeap`.
     * If the current heap does not contain `item`, nothing happens.
     * @returns whether the item transfer is successful
     */
    move(item, otherHeap) {
        if (!this.contains(item))
            return false;
        this.storage.delete(item);
        otherHeap.add(item);
        return true;
    }
    /** Returns a copy of the heap's contents. */
    getHeap() {
        return new Set(this.storage);
    }
}
exports.Heap = Heap;
