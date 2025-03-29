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
exports.RunnerPlugin = void 0;
const ConductorInternalError_1 = require("../../common/errors/ConductorInternalError");
const util_1 = require("../../common/util");
const conduit_1 = require("../../conduit");
const rpc_1 = require("../../conduit/rpc");
const util_2 = require("../../conduit/util");
const types_1 = require("../types");
let RunnerPlugin = (() => {
    let _classDecorators = [util_2.checkIsPluginClass];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var RunnerPlugin = _classThis = class {
        requestFile(fileName) {
            return this.__fileRpc.requestFile(fileName);
        }
        requestChunk() {
            return __awaiter(this, void 0, void 0, function* () {
                return (yield this.__chunkQueue.receive()).chunk;
            });
        }
        requestInput() {
            return __awaiter(this, void 0, void 0, function* () {
                const { message } = yield this.__ioQueue.receive();
                return message;
            });
        }
        tryRequestInput() {
            const out = this.__ioQueue.tryReceive();
            return out === null || out === void 0 ? void 0 : out.message;
        }
        sendOutput(message) {
            this.__ioQueue.send({ message });
        }
        sendError(error) {
            this.__errorChannel.send({ error });
        }
        updateStatus(status, isActive) {
            this.__statusChannel.send({ status, isActive });
        }
        hostLoadPlugin(pluginName) {
            this.__serviceChannel.send(new types_1.PluginServiceMessage(pluginName));
        }
        registerPlugin(pluginClass, ...arg) {
            return this.__conduit.registerPlugin(pluginClass, ...arg);
        }
        unregisterPlugin(plugin) {
            this.__conduit.unregisterPlugin(plugin);
        }
        registerModule(moduleClass) {
            if (!this.__isCompatibleWithModules)
                throw new ConductorInternalError_1.ConductorInternalError("Evaluator has no data interface");
            return this.registerPlugin(moduleClass, this.__evaluator);
        }
        unregisterModule(module) {
            this.unregisterPlugin(module);
        }
        importAndRegisterExternalPlugin(location, ...arg) {
            return __awaiter(this, void 0, void 0, function* () {
                const pluginClass = yield (0, util_1.importExternalPlugin)(location);
                return this.registerPlugin(pluginClass, ...arg);
            });
        }
        importAndRegisterExternalModule(location) {
            return __awaiter(this, void 0, void 0, function* () {
                const moduleClass = yield (0, util_1.importExternalModule)(location);
                return this.registerModule(moduleClass);
            });
        }
        constructor(conduit, [fileChannel, chunkChannel, serviceChannel, ioChannel, errorChannel, statusChannel], evaluatorClass) {
            var _a;
            this.name = "__runner_main" /* InternalPluginName.RUNNER_MAIN */;
            // @ts-expect-error TODO: figure proper way to typecheck this
            this.__serviceHandlers = new Map([
                [0 /* ServiceMessageType.HELLO */, function helloServiceHandler(message) {
                        if (message.data.version < 0 /* Constant.PROTOCOL_MIN_VERSION */) {
                            this.__serviceChannel.send(new types_1.AbortServiceMessage(0 /* Constant.PROTOCOL_MIN_VERSION */));
                            console.error(`Host's protocol version (${message.data.version}) must be at least ${0 /* Constant.PROTOCOL_MIN_VERSION */}`);
                        }
                        else {
                            console.log(`Host is using protocol version ${message.data.version}`);
                        }
                    }],
                [1 /* ServiceMessageType.ABORT */, function abortServiceHandler(message) {
                        console.error(`Host expects at least protocol version ${message.data.minVersion}, but we are on version ${0 /* Constant.PROTOCOL_VERSION */}`);
                        this.__conduit.terminate();
                    }],
                [2 /* ServiceMessageType.ENTRY */, function entryServiceHandler(message) {
                        this.__evaluator.startEvaluator(message.data);
                    }]
            ]);
            this.__conduit = conduit;
            this.__fileRpc = (0, rpc_1.makeRpc)(fileChannel, {});
            this.__chunkQueue = new conduit_1.ChannelQueue(chunkChannel);
            this.__serviceChannel = serviceChannel;
            this.__ioQueue = new conduit_1.ChannelQueue(ioChannel);
            this.__errorChannel = errorChannel;
            this.__statusChannel = statusChannel;
            this.__serviceChannel.send(new types_1.HelloServiceMessage());
            this.__serviceChannel.subscribe(message => {
                var _a;
                (_a = this.__serviceHandlers.get(message.type)) === null || _a === void 0 ? void 0 : _a.call(this, message);
            });
            this.__evaluator = new evaluatorClass(this);
            this.__isCompatibleWithModules = (_a = this.__evaluator.hasDataInterface) !== null && _a !== void 0 ? _a : false;
        }
    };
    __setFunctionName(_classThis, "RunnerPlugin");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        RunnerPlugin = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
    })();
    _classThis.channelAttach = ["__file_rpc" /* InternalChannelName.FILE */, "__chunk" /* InternalChannelName.CHUNK */, "__service" /* InternalChannelName.SERVICE */, "__stdio" /* InternalChannelName.STANDARD_IO */, "__error" /* InternalChannelName.ERROR */, "__status" /* InternalChannelName.STATUS */];
    (() => {
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return RunnerPlugin = _classThis;
})();
exports.RunnerPlugin = RunnerPlugin;
