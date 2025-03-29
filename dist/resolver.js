"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Resolver = void 0;
const ast_types_1 = require("./ast-types");
const tokenizer_1 = require("./tokenizer");
const tokens_1 = require("./tokens");
const errors_1 = require("./errors");
const levenshtein = require('fast-levenshtein');
const RedefineableTokenSentinel = new tokenizer_1.Token(tokens_1.TokenType.AT, "", 0, 0, 0);
class Environment {
    constructor(source, enclosing, names) {
        this.source = source;
        this.enclosing = enclosing;
        this.names = names;
        this.functions = new Set();
        this.moduleBindings = new Set();
    }
    /*
    * Does a full lookup up the environment chain for a name.
    * Returns the distance of the name from the current environment.
    * If name isn't found, return -1.
    * */
    lookupName(identifier) {
        const name = identifier.lexeme;
        let distance = 0;
        let curr = this;
        while (curr !== null) {
            if (curr.names.has(name)) {
                break;
            }
            distance += 1;
            curr = curr.enclosing;
        }
        return (curr === null) ? -1 : distance;
    }
    /* Looks up the name but only for the current environment. */
    lookupNameCurrentEnv(identifier) {
        return this.names.get(identifier.lexeme);
    }
    lookupNameCurrentEnvWithError(identifier) {
        if (this.lookupName(identifier) < 0) {
            throw new errors_1.ResolverErrors.NameNotFoundError(identifier.line, identifier.col, this.source, identifier.indexInSource, identifier.indexInSource + identifier.lexeme.length, this.suggestName(identifier));
        }
    }
    lookupNameParentEnvWithError(identifier) {
        const name = identifier.lexeme;
        let parent = this.enclosing;
        if (parent === null || !parent.names.has(name)) {
            throw new errors_1.ResolverErrors.NameNotFoundError(identifier.line, identifier.col, this.source, identifier.indexInSource, identifier.indexInSource + name.length, this.suggestName(identifier));
        }
    }
    declareName(identifier) {
        const lookup = this.lookupNameCurrentEnv(identifier);
        if (lookup !== undefined && lookup !== RedefineableTokenSentinel) {
            throw new errors_1.ResolverErrors.NameReassignmentError(identifier.line, identifier.col, this.source, identifier.indexInSource, identifier.indexInSource + identifier.lexeme.length, lookup);
        }
        this.names.set(identifier.lexeme, identifier);
    }
    // Same as declareName but allowed to re-declare later.
    declarePlaceholderName(identifier) {
        const lookup = this.lookupNameCurrentEnv(identifier);
        if (lookup !== undefined) {
            throw new errors_1.ResolverErrors.NameReassignmentError(identifier.line, identifier.col, this.source, identifier.indexInSource, identifier.indexInSource + identifier.lexeme.length, lookup);
        }
        this.names.set(identifier.lexeme, RedefineableTokenSentinel);
    }
    suggestNameCurrentEnv(identifier) {
        const name = identifier.lexeme;
        let minDistance = Infinity;
        let minName = null;
        for (const declName of this.names.keys()) {
            const dist = levenshtein.get(name, declName);
            if (dist < minDistance) {
                minDistance = dist;
                minName = declName;
            }
        }
        return minName;
    }
    /*
    * Finds name closest to name in all environments up to builtin environment.
    * Calculated using min levenshtein distance.
    * */
    suggestName(identifier) {
        const name = identifier.lexeme;
        let minDistance = Infinity;
        let minName = null;
        let curr = this;
        while (curr !== null) {
            for (const declName of curr.names.keys()) {
                const dist = levenshtein.get(name, declName);
                if (dist < minDistance) {
                    minDistance = dist;
                    minName = declName;
                }
            }
            curr = curr.enclosing;
        }
        if (minDistance >= 4) {
            // This is pretty far, so just return null
            return null;
        }
        return minName;
    }
}
class Resolver {
    constructor(source, ast) {
        this.source = source;
        this.ast = ast;
        // The global environment
        this.environment = new Environment(source, null, new Map([
            // misc library
            ["_int", new tokenizer_1.Token(tokens_1.TokenType.NAME, "_int", 0, 0, 0)],
            ["_int_from_string", new tokenizer_1.Token(tokens_1.TokenType.NAME, "_int_from_string", 0, 0, 0)],
            ["abs", new tokenizer_1.Token(tokens_1.TokenType.NAME, "abs", 0, 0, 0)],
            ["char_at", new tokenizer_1.Token(tokens_1.TokenType.NAME, "char_at", 0, 0, 0)],
            ["error", new tokenizer_1.Token(tokens_1.TokenType.NAME, "error", 0, 0, 0)],
            ["input", new tokenizer_1.Token(tokens_1.TokenType.NAME, "input", 0, 0, 0)],
            ["isinstance", new tokenizer_1.Token(tokens_1.TokenType.NAME, "isinstance", 0, 0, 0)],
            ["max", new tokenizer_1.Token(tokens_1.TokenType.NAME, "max", 0, 0, 0)],
            ["min", new tokenizer_1.Token(tokens_1.TokenType.NAME, "min", 0, 0, 0)],
            ["print", new tokenizer_1.Token(tokens_1.TokenType.NAME, "print", 0, 0, 0)],
            ["random_random", new tokenizer_1.Token(tokens_1.TokenType.NAME, "random_random", 0, 0, 0)],
            ["round", new tokenizer_1.Token(tokens_1.TokenType.NAME, "round", 0, 0, 0)],
            ["str", new tokenizer_1.Token(tokens_1.TokenType.NAME, "str", 0, 0, 0)],
            ["time_time", new tokenizer_1.Token(tokens_1.TokenType.NAME, "time_time", 0, 0, 0)],
            // math constants
            ["math_pi", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_pi", 0, 0, 0)],
            ["math_e", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_e", 0, 0, 0)],
            ["math_inf", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_inf", 0, 0, 0)],
            ["math_nan", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_nan", 0, 0, 0)],
            ["math_tau", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_tau", 0, 0, 0)],
            // math library
            ["math_acos", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_acos", 0, 0, 0)],
            ["math_acosh", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_acosh", 0, 0, 0)],
            ["math_asin", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_asin", 0, 0, 0)],
            ["math_asinh", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_asinh", 0, 0, 0)],
            ["math_atan", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_atan", 0, 0, 0)],
            ["math_atan2", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_atan2", 0, 0, 0)],
            ["math_atanh", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_atanh", 0, 0, 0)],
            ["math_cbrt", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_cbrt", 0, 0, 0)],
            ["math_ceil", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_ceil", 0, 0, 0)],
            ["math_comb", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_comb", 0, 0, 0)],
            ["math_copysign", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_copysign", 0, 0, 0)],
            ["math_cos", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_cos", 0, 0, 0)],
            ["math_cosh", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_cosh", 0, 0, 0)],
            ["math_degrees", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_degrees", 0, 0, 0)],
            ["math_erf", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_erf", 0, 0, 0)],
            ["math_erfc", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_erfc", 0, 0, 0)],
            ["math_exp", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_exp", 0, 0, 0)],
            ["math_exp2", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_exp2", 0, 0, 0)],
            ["math_expm1", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_expm1", 0, 0, 0)],
            ["math_fabs", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_fabs", 0, 0, 0)],
            ["math_factorial", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_factorial", 0, 0, 0)],
            ["math_floor", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_floor", 0, 0, 0)],
            ["math_fma", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_fma", 0, 0, 0)],
            ["math_fmod", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_fmod", 0, 0, 0)],
            ["math_gamma", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_gamma", 0, 0, 0)],
            ["math_gcd", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_gcd", 0, 0, 0)],
            ["math_isfinite", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_isfinite", 0, 0, 0)],
            ["math_isinf", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_isinf", 0, 0, 0)],
            ["math_isnan", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_isnan", 0, 0, 0)],
            ["math_isqrt", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_isqrt", 0, 0, 0)],
            ["math_lcm", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_lcm", 0, 0, 0)],
            ["math_ldexp", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_ldexp", 0, 0, 0)],
            ["math_lgamma", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_lgamma", 0, 0, 0)],
            ["math_log", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_log", 0, 0, 0)],
            ["math_log10", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_log10", 0, 0, 0)],
            ["math_log1p", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_log1p", 0, 0, 0)],
            ["math_log2", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_log2", 0, 0, 0)],
            ["math_nextafter", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_nextafter", 0, 0, 0)],
            ["math_perm", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_perm", 0, 0, 0)],
            ["math_pow", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_pow", 0, 0, 0)],
            ["math_radians", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_radians", 0, 0, 0)],
            ["math_remainder", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_remainder", 0, 0, 0)],
            ["math_sin", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_sin", 0, 0, 0)],
            ["math_sinh", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_sinh", 0, 0, 0)],
            ["math_sqrt", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_sqrt", 0, 0, 0)],
            ["math_tan", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_tan", 0, 0, 0)],
            ["math_tanh", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_tanh", 0, 0, 0)],
            ["math_trunc", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_trunc", 0, 0, 0)],
            ["math_ulp", new tokenizer_1.Token(tokens_1.TokenType.NAME, "math_ulp", 0, 0, 0)]
        ]));
        this.functionScope = null;
    }
    resolve(stmt) {
        var _a;
        if (stmt === null) {
            return;
        }
        if (stmt instanceof Array) {
            // Resolve all top-level functions first. Python allows functions declared after
            // another function to be used in that function.
            for (const st of stmt) {
                if (st instanceof ast_types_1.StmtNS.FunctionDef) {
                    (_a = this.environment) === null || _a === void 0 ? void 0 : _a.declarePlaceholderName(st.name);
                }
            }
            for (const st of stmt) {
                st.accept(this);
            }
        }
        else {
            stmt.accept(this);
        }
    }
    varDeclNames(names) {
        const res = Array.from(names.values())
            .filter(name => {
            var _a, _b;
            return (
            // Filter out functions and module bindings.
            // Those will be handled separately, so they don't
            // need to be hoisted.
            !((_a = this.environment) === null || _a === void 0 ? void 0 : _a.functions.has(name.lexeme))
                && !((_b = this.environment) === null || _b === void 0 ? void 0 : _b.moduleBindings.has(name.lexeme)));
        });
        return res.length === 0 ? null : res;
    }
    functionVarConstraint(identifier) {
        var _a;
        if (this.functionScope == null) {
            return;
        }
        let curr = this.environment;
        while (curr !== this.functionScope) {
            if (curr !== null && curr.names.has(identifier.lexeme)) {
                const token = curr.names.get(identifier.lexeme);
                if (token === undefined) {
                    throw new Error("placeholder error");
                }
                throw new errors_1.ResolverErrors.NameReassignmentError(identifier.line, identifier.col, this.source, identifier.indexInSource, identifier.indexInSource + identifier.lexeme.length, token);
            }
            curr = (_a = curr === null || curr === void 0 ? void 0 : curr.enclosing) !== null && _a !== void 0 ? _a : null;
        }
    }
    //// STATEMENTS
    visitFileInputStmt(stmt) {
        // Create a new environment.
        const oldEnv = this.environment;
        this.environment = new Environment(this.source, this.environment, new Map());
        this.resolve(stmt.statements);
        // Grab identifiers from that new environment. That are NOT functions.
        // stmt.varDecls = this.varDeclNames(this.environment.names)
        this.environment = oldEnv;
    }
    visitIndentCreation(stmt) {
        // Create a new environment
        this.environment = new Environment(this.source, this.environment, new Map());
    }
    visitDedentCreation(stmt) {
        var _a;
        // Switch to the previous environment.
        if (((_a = this.environment) === null || _a === void 0 ? void 0 : _a.enclosing) !== undefined) {
            this.environment = this.environment.enclosing;
        }
    }
    visitFunctionDefStmt(stmt) {
        var _a, _b;
        (_a = this.environment) === null || _a === void 0 ? void 0 : _a.declareName(stmt.name);
        (_b = this.environment) === null || _b === void 0 ? void 0 : _b.functions.add(stmt.name.lexeme);
        // Create a new environment.
        // const oldEnv = this.environment;
        // Assign the parameters to the new environment.
        const newEnv = new Map(stmt.parameters.map(param => [param.lexeme, param]));
        this.environment = new Environment(this.source, this.environment, newEnv);
        // const params = new Map(
        //     stmt.parameters.map(param => [param.lexeme, param])
        // );
        // if (this.environment !== null) {
        //     this.environment.names = params;
        // }
        this.functionScope = this.environment;
        this.resolve(stmt.body);
        // Grab identifiers from that new environment. That are NOT functions.
        // stmt.varDecls = this.varDeclNames(this.environment.names)
        // Restore old environment
        // this.environment = oldEnv;
    }
    visitAnnAssignStmt(stmt) {
        var _a;
        this.resolve(stmt.ann);
        this.resolve(stmt.value);
        this.functionVarConstraint(stmt.name);
        (_a = this.environment) === null || _a === void 0 ? void 0 : _a.declareName(stmt.name);
    }
    visitAssignStmt(stmt) {
        var _a;
        this.resolve(stmt.value);
        this.functionVarConstraint(stmt.name);
        (_a = this.environment) === null || _a === void 0 ? void 0 : _a.declareName(stmt.name);
    }
    visitAssertStmt(stmt) {
        this.resolve(stmt.value);
    }
    visitForStmt(stmt) {
        var _a;
        (_a = this.environment) === null || _a === void 0 ? void 0 : _a.declareName(stmt.target);
        this.resolve(stmt.iter);
        this.resolve(stmt.body);
    }
    visitIfStmt(stmt) {
        this.resolve(stmt.condition);
        this.resolve(stmt.body);
        this.resolve(stmt.elseBlock);
    }
    // @TODO we need to treat all global statements as variable declarations in the global
    // scope.
    visitGlobalStmt(stmt) {
        // Do nothing because global can also be declared in our
        // own scope.
    }
    // @TODO nonlocals mean that any variable following that name in the current env
    // should not create a variable declaration, but instead point to an outer variable.
    visitNonLocalStmt(stmt) {
        var _a;
        (_a = this.environment) === null || _a === void 0 ? void 0 : _a.lookupNameParentEnvWithError(stmt.name);
    }
    visitReturnStmt(stmt) {
        if (stmt.value !== null) {
            this.resolve(stmt.value);
        }
    }
    visitWhileStmt(stmt) {
        this.resolve(stmt.condition);
        this.resolve(stmt.body);
    }
    visitSimpleExprStmt(stmt) {
        this.resolve(stmt.expression);
    }
    visitFromImportStmt(stmt) {
        var _a, _b;
        for (const name of stmt.names) {
            (_a = this.environment) === null || _a === void 0 ? void 0 : _a.declareName(name);
            (_b = this.environment) === null || _b === void 0 ? void 0 : _b.moduleBindings.add(name.lexeme);
        }
    }
    visitContinueStmt(stmt) {
    }
    visitBreakStmt(stmt) {
    }
    visitPassStmt(stmt) {
    }
    //// EXPRESSIONS
    visitVariableExpr(expr) {
        var _a;
        (_a = this.environment) === null || _a === void 0 ? void 0 : _a.lookupNameCurrentEnvWithError(expr.name);
    }
    visitLambdaExpr(expr) {
        // Create a new environment.
        const oldEnv = this.environment;
        // Assign the parameters to the new environment.
        const newEnv = new Map(expr.parameters.map(param => [param.lexeme, param]));
        this.environment = new Environment(this.source, this.environment, newEnv);
        this.resolve(expr.body);
        // Restore old environment
        this.environment = oldEnv;
    }
    visitMultiLambdaExpr(expr) {
        // Create a new environment.
        const oldEnv = this.environment;
        // Assign the parameters to the new environment.
        const newEnv = new Map(expr.parameters.map(param => [param.lexeme, param]));
        this.environment = new Environment(this.source, this.environment, newEnv);
        this.resolve(expr.body);
        // Grab identifiers from that new environment.
        expr.varDecls = Array.from(this.environment.names.values());
        // Restore old environment
        this.environment = oldEnv;
    }
    visitUnaryExpr(expr) {
        this.resolve(expr.right);
    }
    visitGroupingExpr(expr) {
        this.resolve(expr.expression);
    }
    visitBinaryExpr(expr) {
        this.resolve(expr.left);
        this.resolve(expr.right);
    }
    visitBoolOpExpr(expr) {
        this.resolve(expr.left);
        this.resolve(expr.right);
    }
    visitCompareExpr(expr) {
        this.resolve(expr.left);
        this.resolve(expr.right);
    }
    visitCallExpr(expr) {
        this.resolve(expr.callee);
        this.resolve(expr.args);
    }
    visitTernaryExpr(expr) {
        this.resolve(expr.predicate);
        this.resolve(expr.consequent);
        this.resolve(expr.alternative);
    }
    visitNoneExpr(expr) {
    }
    visitLiteralExpr(expr) {
    }
    visitBigIntLiteralExpr(expr) {
    }
    visitComplexExpr(expr) {
    }
}
exports.Resolver = Resolver;
