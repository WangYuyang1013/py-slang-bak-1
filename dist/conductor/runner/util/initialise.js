"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialise = initialise;
const __1 = require("..");
const conduit_1 = require("../../../conduit");
/**
 * Initialise this runner with the evaluator to be used.
 * @param evaluatorClass The Evaluator to be used on this runner.
 * @param link The underlying communication link.
 * @returns The initialised `runnerPlugin` and `conduit`.
 */
function initialise(evaluatorClass, link = self) {
    const conduit = new conduit_1.Conduit(link, false);
    const runnerPlugin = conduit.registerPlugin(__1.RunnerPlugin, evaluatorClass);
    return { runnerPlugin, conduit };
}
