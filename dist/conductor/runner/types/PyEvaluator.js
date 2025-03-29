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
exports.PyEvaluator = void 0;
const __1 = require("../../../");
const context_1 = require("../../../cse-machine/context");
const BasicEvaluator_1 = require("../BasicEvaluator");
const defaultContext = new context_1.Context();
const defaultOptions = {
    isPrelude: false,
    envSteps: 100000,
    stepLimit: 100000
};
class PyEvaluator extends BasicEvaluator_1.BasicEvaluator {
    constructor(conductor) {
        super(conductor);
        this.context = defaultContext;
        this.options = defaultOptions;
    }
    evaluateChunk(chunk) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield (0, __1.runInContext)(chunk, // Code
                this.context, this.options);
                this.conductor.sendOutput(`Result: ${result}`);
            }
            catch (error) {
                this.conductor.sendOutput(`Error: ${error instanceof Error ? error.message : error}`);
            }
        });
    }
}
exports.PyEvaluator = PyEvaluator;
// runInContext
// IOptions
// Context
// BasicEvaluator;
// IRunnerPlugin
