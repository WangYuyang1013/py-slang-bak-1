"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelloServiceMessage = void 0;
class HelloServiceMessage {
    constructor() {
        this.type = 0 /* ServiceMessageType.HELLO */;
        this.data = { version: 0 /* Constant.PROTOCOL_VERSION */ };
    }
}
exports.HelloServiceMessage = HelloServiceMessage;
