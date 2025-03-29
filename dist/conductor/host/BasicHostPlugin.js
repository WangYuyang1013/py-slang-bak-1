"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasicHostPlugin = void 0;
const util_1 = require("../../common/util");
const rpc_1 = require("../../conduit/rpc");
const util_2 = require("../../conduit/util");
const types_1 = require("../types");
let BasicHostPlugin = (() => {
    let _classDecorators = [util_2.checkIsPluginClass];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var BasicHostPlugin = _classThis = class {
        startEvaluator(entryPoint) {
            this.__serviceChannel.send(new types_1.EntryServiceMessage(entryPoint));
        }
        sendChunk(chunk) {
            this.__chunkChannel.send({ id: this.__chunkCount++, chunk });
        }
        sendInput(message) {
            this.__ioChannel.send({ message });
        }
        isStatusActive(status) {
            var _a;
            return (_a = this.__status.get(status)) !== null && _a !== void 0 ? _a : false;
        }
        registerPlugin(pluginClass, ...arg) {
            return this.__conduit.registerPlugin(pluginClass, ...arg);
        }
        unregisterPlugin(plugin) {
            this.__conduit.unregisterPlugin(plugin);
        }
        importAndRegisterExternalPlugin(location, ...arg) {
            return __awaiter(this, void 0, void 0, function* () {
                const pluginClass = yield (0, util_1.importExternalPlugin)(location);
                return this.registerPlugin(pluginClass, ...arg);
            });
        }
        constructor(conduit, [fileChannel, chunkChannel, serviceChannel, ioChannel, errorChannel, statusChannel]) {
            this.name = "__host_main" /* InternalPluginName.HOST_MAIN */;
            this.__status = new Map();
            this.__chunkCount = 0;
            // @ts-expect-error TODO: figure proper way to typecheck this
            this.__serviceHandlers = new Map([
                [0 /* ServiceMessageType.HELLO */, function helloServiceHandler(message) {
                        if (message.data.version < 0 /* Constant.PROTOCOL_MIN_VERSION */) {
                            this.__serviceChannel.send(new types_1.AbortServiceMessage(0 /* Constant.PROTOCOL_MIN_VERSION */));
                            console.error(`Runner's protocol version (${message.data.version}) must be at least ${0 /* Constant.PROTOCOL_MIN_VERSION */}`);
                        }
                        else {
                            console.log(`Runner is using protocol version ${message.data.version}`);
                        }
                    }],
                [1 /* ServiceMessageType.ABORT */, function abortServiceHandler(message) {
                        console.error(`Runner expects at least protocol version ${message.data.minVersion}, but we are on version ${0 /* Constant.PROTOCOL_VERSION */}`);
                        this.__conduit.terminate();
                    }],
                [3 /* ServiceMessageType.PLUGIN */, function pluginServiceHandler(message) {
                        const pluginName = message.data;
                        this.requestLoadPlugin(pluginName);
                    }]
            ]);
            this.__conduit = conduit;
            (0, rpc_1.makeRpc)(fileChannel, {
                requestFile: this.requestFile.bind(this)
            });
            this.__chunkChannel = chunkChannel;
            this.__serviceChannel = serviceChannel;
            this.__ioChannel = ioChannel;
            ioChannel.subscribe((ioMessage) => { var _a; return (_a = this.receiveOutput) === null || _a === void 0 ? void 0 : _a.call(this, ioMessage.message); });
            errorChannel.subscribe((errorMessage) => { var _a; return (_a = this.receiveError) === null || _a === void 0 ? void 0 : _a.call(this, errorMessage.error); });
            statusChannel.subscribe((statusMessage) => {
                var _a;
                const { status, isActive } = statusMessage;
                this.__status.set(status, isActive);
                (_a = this.receiveStatusUpdate) === null || _a === void 0 ? void 0 : _a.call(this, status, isActive);
            });
            this.__serviceChannel.send(new types_1.HelloServiceMessage());
            this.__serviceChannel.subscribe(message => {
                var _a;
                (_a = this.__serviceHandlers.get(message.type)) === null || _a === void 0 ? void 0 : _a.call(this, message);
            });
        }
    };
    __setFunctionName(_classThis, "BasicHostPlugin");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        BasicHostPlugin = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
    })();
    _classThis.channelAttach = ["__file_rpc" /* InternalChannelName.FILE */, "__chunk" /* InternalChannelName.CHUNK */, "__service" /* InternalChannelName.SERVICE */, "__stdio" /* InternalChannelName.STANDARD_IO */, "__error" /* InternalChannelName.ERROR */, "__status" /* InternalChannelName.STATUS */];
    (() => {
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return BasicHostPlugin = _classThis;
})();
exports.BasicHostPlugin = BasicHostPlugin;
