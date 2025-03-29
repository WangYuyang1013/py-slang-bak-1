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
exports.ChannelQueue = void 0;
const ds_1 = require("../common/ds");
class ChannelQueue {
    receive() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.__messageQueue.pop();
        });
    }
    tryReceive() {
        return this.__messageQueue.tryPop();
    }
    send(message, transfer) {
        this.__channel.send(message, transfer);
    }
    close() {
        this.__channel.unsubscribe(this.__messageQueue.push);
    }
    constructor(channel) {
        this.__messageQueue = new ds_1.MessageQueue();
        this.name = channel.name;
        this.__channel = channel;
        this.__channel.subscribe(this.__messageQueue.push);
    }
}
exports.ChannelQueue = ChannelQueue;
