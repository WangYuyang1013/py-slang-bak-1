"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Channel = void 0;
const ConductorInternalError_1 = require("../common/errors/ConductorInternalError");
class Channel {
    send(message, transfer) {
        this.__verifyAlive();
        this.__port.postMessage(message, transfer !== null && transfer !== void 0 ? transfer : []);
    }
    subscribe(subscriber) {
        this.__verifyAlive();
        this.__subscribers.add(subscriber);
        if (this.__waitingMessages) {
            for (const data of this.__waitingMessages) {
                subscriber(data);
            }
            delete this.__waitingMessages;
        }
    }
    unsubscribe(subscriber) {
        this.__verifyAlive();
        this.__subscribers.delete(subscriber);
    }
    close() {
        var _a;
        this.__verifyAlive();
        this.__isAlive = false;
        (_a = this.__port) === null || _a === void 0 ? void 0 : _a.close();
    }
    /**
     * Check if this Channel is allowed to be used.
     * @throws Throws an error if the Channel has been closed.
     */
    __verifyAlive() {
        if (!this.__isAlive)
            throw new ConductorInternalError_1.ConductorInternalError(`Channel ${this.name} has been closed`);
    }
    /**
     * Dispatch some data to subscribers.
     * @param data The data to be dispatched to subscribers.
     */
    __dispatch(data) {
        this.__verifyAlive();
        if (this.__waitingMessages) {
            this.__waitingMessages.push(data);
        }
        else {
            for (const subscriber of this.__subscribers) {
                subscriber(data);
            }
        }
    }
    /**
     * Listens to the port's message event, and starts the port.
     * Messages will be buffered until the first subscriber listens to the Channel.
     * @param port The MessagePort to listen to.
     */
    listenToPort(port) {
        port.addEventListener("message", e => this.__dispatch(e.data));
        port.start();
    }
    /**
     * Replaces the underlying MessagePort of this Channel and closes it, and starts the new port.
     * @param port The new port to use.
     */
    replacePort(port) {
        var _a;
        this.__verifyAlive();
        (_a = this.__port) === null || _a === void 0 ? void 0 : _a.close();
        this.__port = port;
        this.listenToPort(port);
    }
    constructor(name, port) {
        /** The callbacks subscribed to this Channel. */
        this.__subscribers = new Set(); // TODO: use WeakRef? but callbacks tend to be thrown away and leaking is better than incorrect behaviour
        /** Is the Channel allowed to be used? */
        this.__isAlive = true;
        this.__waitingMessages = [];
        this.name = name;
        this.replacePort(port);
    }
}
exports.Channel = Channel;
