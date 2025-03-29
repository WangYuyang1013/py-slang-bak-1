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
exports.BasicEvaluator = void 0;
const errors_1 = require("../../common/errors");
class BasicEvaluator {
    startEvaluator(entryPoint) {
        return __awaiter(this, void 0, void 0, function* () {
            const initialChunk = yield this.conductor.requestFile(entryPoint);
            if (!initialChunk)
                throw new errors_1.ConductorInternalError("Cannot load entrypoint file");
            yield this.evaluateFile(entryPoint, initialChunk);
            while (true) {
                const chunk = yield this.conductor.requestChunk();
                yield this.evaluateChunk(chunk);
            }
        });
    }
    /**
     * Evaluates a file.
     * @param fileName The name of the file to be evaluated.
     * @param fileContent The content of the file to be evaluated.
     * @returns A promise that resolves when the evaluation is complete.
     */
    evaluateFile(fileName, fileContent) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.evaluateChunk(fileContent);
        });
    }
    constructor(conductor) {
        this.conductor = conductor;
    }
}
exports.BasicEvaluator = BasicEvaluator;
