"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RpcErrorMessage = void 0;
class RpcErrorMessage {
    constructor(invokeId, err) {
        this.type = 2 /* RpcMessageType.RETURN_ERR */;
        this.data = { invokeId, err };
    }
}
exports.RpcErrorMessage = RpcErrorMessage;
