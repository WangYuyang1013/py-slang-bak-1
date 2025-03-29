"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RpcReturnMessage = void 0;
class RpcReturnMessage {
    constructor(invokeId, res) {
        this.type = 1 /* RpcMessageType.RETURN */;
        this.data = { invokeId, res };
    }
}
exports.RpcReturnMessage = RpcReturnMessage;
