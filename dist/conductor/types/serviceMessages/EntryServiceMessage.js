"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntryServiceMessage = void 0;
class EntryServiceMessage {
    constructor(entryPoint) {
        this.type = 2 /* ServiceMessageType.ENTRY */;
        this.data = entryPoint;
    }
}
exports.EntryServiceMessage = EntryServiceMessage;
