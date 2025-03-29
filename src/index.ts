/* Use as a command line script */
/* npm run start:dev -- test.py */
/* npm run start:dev -- test.py tsc --maxErrors 1 */

import { Tokenizer } from "./tokenizer";
import { Parser } from "./parser";
import { Translator } from "./translator";
import { Program } from "estree";
import { Resolver } from "./resolver";
import { Context } from './cse-machine/context';
import { evaluate } from './cse-machine/interpreter';
export * from './errors';
import fs from "fs";
import { ParserErrors, ResolverErrors, TokenizerErrors } from "./errors";
import { Value } from "./cse-machine/stash";
import { Finished, RecursivePartial, Result } from "./types";
import { runCSEMachine } from "./runner/pyRunner";
import { initialise } from "./conductor/runner/util/initialise";
import { PyEvaluator } from "./conductor/runner/types/PyEvaluator";

export function parsePythonToEstreeAst(code: string,
    variant: number = 1,
    doValidate: boolean = false): Program {
    const script = code + '\n'
    const tokenizer = new Tokenizer(script)
    const tokens = tokenizer.scanEverything()
    const pyParser = new Parser(script, tokens)
    const ast = pyParser.parse()
    if (doValidate) {
        new Resolver(script, ast).resolve(ast);
    }
    const translator = new Translator(script)
    return translator.resolve(ast) as unknown as Program
}

// import {ParserErrors, ResolverErrors, TokenizerErrors} from "./errors";
// import fs from "fs";
// const BaseParserError = ParserErrors.BaseParserError;
// const BaseTokenizerError = TokenizerErrors.BaseTokenizerError;
// const BaseResolverError = ResolverErrors.BaseResolverError;
// if (process.argv.length > 2) {
//     try {
//         let text = fs.readFileSync(process.argv[2], 'utf8');
//         // Add a new line just in case
//         text += '\n';
//         const tokenizer = new Tokenizer(text);
//         const tokens = tokenizer.scanEverything();
//         tokenizer.printTokens();
//         const parser = new Parser(text, tokens);
//         const ast = parser.parse();
//         // const resolver = new Resolver(text, ast);
//         // resolver.resolve(ast);
//         console.dir(ast, { depth: null });
//         const translator = new Translator(text);
//         const estreeAst = translator.resolve(ast);
//         console.dir(estreeAst, { depth: null });
//     } catch (e) {
//         if (e instanceof BaseTokenizerError
//             || e instanceof BaseParserError
//             || e instanceof BaseResolverError) {
//             console.error(e.message);
//         } else {
//             throw e;
//         }
//     }
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

//         // Test for parsePythonToEstreeAst
//         const estreeAst = parsePythonToEstreeAst(code, 1, true);

//         console.log("Generated ESTree AST:");
//         console.dir(estreeAst, { depth: null });
        
//         const result = evaluate(estreeAst, context, options);
//         console.info('\n\n');
//         console.info(result);
//         console.info(result.value);
//         console.info((result as Value).value.toString());
//         console.info('done');
        

//         //console.log("Syntax and semantic check passed.");
        
//         // const rootNode = {
//         //     type: estreeAst.type,
//         //     sourceType: estreeAst.sourceType,
//         //     loc: estreeAst.loc
//         //   };
         
//         // console.log('AST 根节点:', rootNode);
//     } catch (e) {
//         if (
//             e instanceof BaseTokenizerError ||
//             e instanceof BaseParserError ||
//             e instanceof BaseResolverError
//         ) {
//             console.error("Parsing Error:", e.message);
//         }
//     }
//     console.log(process.versions.v8);

// }

export interface IOptions {
    isPrelude: boolean,
    envSteps: number,
    stepLimit: number
};

export async function runInContext(
    code: string,
    context: Context,
    options: RecursivePartial<IOptions> = {}
): Promise<Result> {
    const estreeAst = parsePythonToEstreeAst(code, 1, true);
    const result = runCSEMachine(estreeAst, context, options);
    return result;
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
const {runnerPlugin, conduit} = initialise(PyEvaluator);

