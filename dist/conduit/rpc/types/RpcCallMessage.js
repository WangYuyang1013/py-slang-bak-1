"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RpcCallMessage = void 0;
class RpcCallMessage {
    constructor(fn, args, invokeId) {
        this.type = 0 /* RpcMessageType.CALL */;
        this.data = { fn, args, invokeId };
    }
}
exports.RpcCallMessage = RpcCallMessage;
