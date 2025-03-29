"use strict";
/* Use as a command line script */
/* npm run start:dev -- test.py */
/* npm run start:dev -- test.py tsc --maxErrors 1 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePythonToEstreeAst = parsePythonToEstreeAst;
exports.runInContext = runInContext;
const tokenizer_1 = require("./tokenizer");
const parser_1 = require("./parser");
const translator_1 = require("./translator");
const resolver_1 = require("./resolver");
__exportStar(require("./errors"), exports);
const pyRunner_1 = require("./runner/pyRunner");
const initialise_1 = require("./conductor/runner/util/initialise");
const PyEvaluator_1 = require("./conductor/runner/types/PyEvaluator");
function parsePythonToEstreeAst(code, variant = 1, doValidate = false) {
    const script = code + '\n';
    const tokenizer = new tokenizer_1.Tokenizer(script);
    const tokens = tokenizer.scanEverything();
    const pyParser = new parser_1.Parser(script, tokens);
    const ast = pyParser.parse();
    if (doValidate) {
        new resolver_1.Resolver(script, ast).resolve(ast);
    }
    const translator = new translator_1.Translator(script);
    return translator.resolve(ast);
}
;
function runInContext(code_1, context_1) {
    return __awaiter(this, arguments, void 0, function* (code, context, options = {}) {
        const estreeAst = parsePythonToEstreeAst(code, 1, true);
        const result = (0, pyRunner_1.runCSEMachine)(estreeAst, context, options);
        return result;
    });
}
// local test only
// const context = new Context();
// const options: IOptions = {
//     isPrelude: false,
//     envSteps: 100000,
//     stepLimit: 100000
// };
// const BaseParserError = ParserErrors.BaseParserError;
// const BaseTokenizerError = TokenizerErrors.BaseTokenizerError;
// const BaseResolverError = ResolverErrors.BaseResolverError;
// async function getResult(code: string,
//     context: Context,
//     options: RecursivePartial<IOptions> = {}): Promise<Result>  {
//     const result = ;
//     return result;
// }
// if (require.main === module) {
//     if (process.argv.length < 3) {
//         console.error("Usage: npm run start:dev -- <python-file>");
//         process.exit(1);
//     }
//     const filePath = process.argv[2];
//     try {
//         const code = fs.readFileSync(filePath, "utf8") + "\n";
//         console.log(`Parsing Python file: ${filePath}`);
//         const result = await runInContext(code, context, options);
//         console.info(result);
//     } catch (e) {
//     }
//     //console.log(process.versions.v8);
// }
// if (require.main === module) {
//     (async () => {
//       if (process.argv.length < 3) {
//         console.error("Usage: npm run start:dev -- <python-file>");
//         process.exit(1);
//       }
//       const filePath = process.argv[2];
//       try {
//         const code = fs.readFileSync(filePath, "utf8") + "\n";
//         console.log(`Parsing Python file: ${filePath}`);
//         const result = await runInContext(code, context, options);
//         console.info(result);
//         console.info((result as Finished).value);
//         console.info((result as Finished).representation.toString((result as Finished).value));
//       } catch (e) {
//         console.error("Error:", e);
//       }
//     })();
// }
//conductor/runner/types/IEvaluator
//conductor/runner/BasicEvaluator
//conductor/runner/util/initialise
const { runnerPlugin, conduit } = (0, initialise_1.initialise)(PyEvaluator_1.PyEvaluator);
