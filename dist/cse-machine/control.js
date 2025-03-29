"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Control = void 0;
const stack_1 = require("./stack");
const ast_helper_1 = require("./ast-helper");
const utils_1 = require("./utils");
class Control extends stack_1.Stack {
    constructor(program) {
        super();
        this.numEnvDependentItems = 0;
        // Load program into control stack
        program ? this.push(program) : null;
    }
    canAvoidEnvInstr() {
        return this.numEnvDependentItems === 0;
    }
    // For testing purposes
    getNumEnvDependentItems() {
        return this.numEnvDependentItems;
    }
    pop() {
        const item = super.pop();
        if (item !== undefined && (0, utils_1.isEnvDependent)(item)) {
            this.numEnvDependentItems--;
        }
        return item;
    }
    push(...items) {
        const itemsNew = Control.simplifyBlocksWithoutDeclarations(...items);
        itemsNew.forEach((item) => {
            if ((0, utils_1.isEnvDependent)(item)) {
                this.numEnvDependentItems++;
            }
        });
        super.push(...itemsNew);
    }
    /**
     * Before pushing block statements on the control stack, we check if the block statement has any declarations.
     * If not, the block is converted to a StatementSequence.
     * @param items The items being pushed on the control.
     * @returns The same set of control items, but with block statements without declarations converted to StatementSequences.
     * NOTE: this function handles any case where StatementSequence has to be converted back into BlockStatement due to type issues
     */
    static simplifyBlocksWithoutDeclarations(...items) {
        const itemsNew = [];
        items.forEach(item => {
            if ((0, ast_helper_1.isNode)(item) && (0, ast_helper_1.isBlockStatement)(item) && !(0, ast_helper_1.hasDeclarations)(item)) {
                // Push block body as statement sequence
                const seq = (0, ast_helper_1.statementSequence)(item.body, item.loc);
                itemsNew.push(seq);
            }
            else {
                itemsNew.push(item);
            }
        });
        return itemsNew;
    }
    copy() {
        const newControl = new Control();
        const stackCopy = super.getStack();
        newControl.push(...stackCopy);
        return newControl;
    }
}
exports.Control = Control;
