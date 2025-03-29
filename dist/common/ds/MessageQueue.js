"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageQueue = void 0;
const Queue_1 = require("./Queue");
class MessageQueue {
    push(item) {
        if (this.__promiseQueue.length !== 0)
            this.__promiseQueue.pop()(item);
        else
            this.__inputQueue.push(item);
    }
    pop() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.__inputQueue.length !== 0)
                return this.__inputQueue.pop();
            return new Promise((resolve, _reject) => {
                this.__promiseQueue.push(resolve);
            });
        });
    }
    tryPop() {
        if (this.__inputQueue.length !== 0)
            return this.__inputQueue.pop();
        return undefined;
    }
    constructor() {
        this.__inputQueue = new Queue_1.Queue();
        this.__promiseQueue = new Queue_1.Queue();
        this.push = this.push.bind(this);
    }
}
exports.MessageQueue = MessageQueue;
