"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moduleMethod = moduleMethod;
function moduleMethod(args, returnType) {
    const signature = { args, returnType };
    function externalClosureDecorator(method, _context) {
        method.signature = signature;
    }
    return externalClosureDecorator;
}
