"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginServiceMessage = void 0;
class PluginServiceMessage {
    constructor(pluginName) {
        this.type = 3 /* ServiceMessageType.PLUGIN */;
        this.data = pluginName;
    }
}
exports.PluginServiceMessage = PluginServiceMessage;
