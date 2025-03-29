"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbortServiceMessage = void 0;
class AbortServiceMessage {
    constructor(minVersion) {
        this.type = 1 /* ServiceMessageType.ABORT */;
        this.data = { minVersion: minVersion };
    }
}
exports.AbortServiceMessage = AbortServiceMessage;
