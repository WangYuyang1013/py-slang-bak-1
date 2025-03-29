"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accumulate = exports.stdlib = void 0;
const list_1 = require("./list");
Object.defineProperty(exports, "accumulate", { enumerable: true, get: function () { return list_1.accumulate; } });
exports.stdlib = {
    is_list: list_1.is_list,
    accumulate: list_1.accumulate,
    length: list_1.length
};
