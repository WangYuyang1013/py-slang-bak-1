"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Conduit = void 0;
const ConductorInternalError_1 = require("../common/errors/ConductorInternalError");
const Channel_1 = require("./Channel");
class Conduit {
    __negotiateChannel(channelName) {
        const { port1, port2 } = new MessageChannel();
        const channel = new Channel_1.Channel(channelName, port1);
        this.__link.postMessage([channelName, port2], [port2]); // TODO: update communication protocol?
        this.__channels.set(channelName, channel);
    }
    __verifyAlive() {
        if (!this.__alive)
            throw new ConductorInternalError_1.ConductorInternalError("Conduit already terminated");
    }
    registerPlugin(pluginClass, ...arg) {
        this.__verifyAlive();
        const attachedChannels = [];
        for (const channelName of pluginClass.channelAttach) {
            if (!this.__channels.has(channelName))
                this.__negotiateChannel(channelName);
            attachedChannels.push(this.__channels.get(channelName)); // as the Channel has been negotiated
        }
        const plugin = new pluginClass(this, attachedChannels, ...arg);
        if (plugin.name !== undefined) {
            if (this.__pluginMap.has(plugin.name))
                throw new ConductorInternalError_1.ConductorInternalError(`Plugin ${plugin.name} already registered`);
            this.__pluginMap.set(plugin.name, plugin);
        }
        this.__plugins.push(plugin);
        return plugin;
    }
    unregisterPlugin(plugin) {
        var _a;
        this.__verifyAlive();
        let p = 0;
        for (let i = 0; i < this.__plugins.length; ++i) {
            if (this.__plugins[p] === plugin)
                ++p;
            this.__plugins[i] = this.__plugins[i + p];
        }
        for (let i = this.__plugins.length - 1, e = this.__plugins.length - p; i >= e; --i) {
            delete this.__plugins[i];
        }
        if (plugin.name) {
            this.__pluginMap.delete(plugin.name);
        }
        (_a = plugin.destroy) === null || _a === void 0 ? void 0 : _a.call(plugin);
    }
    lookupPlugin(pluginName) {
        this.__verifyAlive();
        if (!this.__pluginMap.has(pluginName))
            throw new ConductorInternalError_1.ConductorInternalError(`Plugin ${pluginName} not registered`);
        return this.__pluginMap.get(pluginName); // as the map has been checked
    }
    terminate() {
        var _a, _b, _c;
        this.__verifyAlive();
        for (const plugin of this.__plugins) {
            //this.unregisterPlugin(plugin);
            (_a = plugin.destroy) === null || _a === void 0 ? void 0 : _a.call(plugin);
        }
        (_c = (_b = this.__link).terminate) === null || _c === void 0 ? void 0 : _c.call(_b);
        this.__alive = false;
    }
    __handlePort(data) {
        const [channelName, port] = data;
        if (this.__channels.has(channelName)) { // uh-oh, we already have a port for this channel
            const channel = this.__channels.get(channelName); // as the map has been checked
            if (this.__parent) { // extract the data and discard the messageport; child's Channel will close it
                channel.listenToPort(port);
            }
            else { // replace our messageport; Channel will close it
                channel.replacePort(port);
            }
        }
        else { // register the new channel
            const channel = new Channel_1.Channel(channelName, port);
            this.__channels.set(channelName, channel);
        }
    }
    constructor(link, parent = false) {
        this.__alive = true;
        this.__channels = new Map();
        this.__pluginMap = new Map();
        this.__plugins = [];
        this.__link = link;
        link.addEventListener("message", e => this.__handlePort(e.data));
        this.__parent = parent;
    }
}
exports.Conduit = Conduit;
