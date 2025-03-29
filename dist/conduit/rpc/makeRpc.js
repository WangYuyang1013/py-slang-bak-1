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
exports.makeRpc = makeRpc;
const types_1 = require("./types");
function makeRpc(channel, self) {
    const waiting = [];
    let invocations = 0;
    const otherCallbacks = {};
    channel.subscribe((rpcMessage) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        switch (rpcMessage.type) {
            case 0 /* RpcMessageType.CALL */:
                {
                    const { fn, args, invokeId } = rpcMessage.data;
                    try {
                        // @ts-expect-error
                        const res = yield self[fn](...args);
                        if (invokeId > 0)
                            channel.send(new types_1.RpcReturnMessage(invokeId, res));
                    }
                    catch (err) {
                        if (invokeId > 0)
                            channel.send(new types_1.RpcErrorMessage(invokeId, err));
                    }
                    break;
                }
            case 1 /* RpcMessageType.RETURN */:
                {
                    const { invokeId, res } = rpcMessage.data;
                    (_b = (_a = waiting[invokeId]) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.call(_a, res);
                    delete waiting[invokeId];
                    break;
                }
            case 2 /* RpcMessageType.RETURN_ERR */:
                {
                    const { invokeId, err } = rpcMessage.data;
                    (_d = (_c = waiting[invokeId]) === null || _c === void 0 ? void 0 : _c[1]) === null || _d === void 0 ? void 0 : _d.call(_c, err);
                    delete waiting[invokeId];
                    break;
                }
        }
    }));
    return new Proxy(otherCallbacks, {
        get(target, p, receiver) {
            const cb = Reflect.get(target, p, receiver);
            if (cb)
                return cb;
            const newCallback = typeof p === "string" && p.charAt(0) === "$"
                ? (...args) => {
                    channel.send(new types_1.RpcCallMessage(p, args, 0));
                }
                : (...args) => {
                    const invokeId = ++invocations;
                    channel.send(new types_1.RpcCallMessage(p, args, invokeId));
                    return new Promise((resolve, reject) => {
                        waiting[invokeId] = [resolve, reject];
                    });
                };
            Reflect.set(target, p, newCallback, receiver);
            return newCallback;
        },
    });
}
