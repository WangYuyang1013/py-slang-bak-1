"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Representation = exports.PyComplexNumber = exports.ErrorSeverity = exports.ErrorType = exports.CSEBreak = void 0;
const stdlib_1 = require("./stdlib");
class CSEBreak {
}
exports.CSEBreak = CSEBreak;
// export class CseError {
//     constructor(public readonly error: any) {}
// }
var ErrorType;
(function (ErrorType) {
    ErrorType["IMPORT"] = "Import";
    ErrorType["RUNTIME"] = "Runtime";
    ErrorType["SYNTAX"] = "Syntax";
    ErrorType["TYPE"] = "Type";
})(ErrorType || (exports.ErrorType = ErrorType = {}));
var ErrorSeverity;
(function (ErrorSeverity) {
    ErrorSeverity["WARNING"] = "Warning";
    ErrorSeverity["ERROR"] = "Error";
})(ErrorSeverity || (exports.ErrorSeverity = ErrorSeverity = {}));
class PyComplexNumber {
    constructor(real, imag) {
        this.real = real;
        this.imag = imag;
    }
    static fromNumber(value) {
        return new PyComplexNumber(value, 0);
    }
    static fromBigInt(value) {
        return new PyComplexNumber(Number(value), 0);
    }
    static fromString(str) {
        if (!/[jJ]/.test(str)) {
            const realVal = Number(str);
            if (isNaN(realVal)) {
                throw new Error(`Invalid complex string: ${str}`);
            }
            return new PyComplexNumber(realVal, 0);
        }
        const lower = str.toLowerCase();
        if (lower.endsWith('j')) {
            const numericPart = str.substring(0, str.length - 1);
            if (numericPart === '' || numericPart === '+' || numericPart === '-') {
                const sign = (numericPart === '-') ? -1 : 1;
                return new PyComplexNumber(0, sign * 1);
            }
            const imagVal = Number(numericPart);
            if (isNaN(imagVal)) {
                throw new Error(`Invalid complex string: ${str}`);
            }
            return new PyComplexNumber(0, imagVal);
        }
        const match = str.match(/^([\+\-]?\d+(\.\d+)?([eE][+\-]?\d+)?)([\+\-]\d+(\.\d+)?([eE][+\-]?\d+)?)?[jJ]?$/);
        if (!match) {
            throw new Error(`Invalid complex string: ${str}`);
        }
        const realPart = Number(match[1]);
        let imagPart = 0;
        if (match[4]) {
            imagPart = Number(match[4]);
        }
        return new PyComplexNumber(realPart, imagPart);
    }
    static fromValue(value) {
        if (value instanceof PyComplexNumber) {
            return new PyComplexNumber(value.real, value.imag);
        }
        if (typeof value === "number") {
            return PyComplexNumber.fromNumber(value);
        }
        if (typeof value === "bigint") {
            return PyComplexNumber.fromBigInt(value);
        }
        return PyComplexNumber.fromString(value);
    }
    /**
     * operations
     */
    add(other) {
        return new PyComplexNumber(this.real + other.real, this.imag + other.imag);
    }
    sub(other) {
        return new PyComplexNumber(this.real - other.real, this.imag - other.imag);
    }
    mul(other) {
        // (a+bi)*(c+di) = (ac - bd) + (bc + ad)i
        const realPart = this.real * other.real - this.imag * other.imag;
        const imagPart = this.real * other.imag + this.imag * other.real;
        return new PyComplexNumber(realPart, imagPart);
    }
    // https://github.com/python/cpython/blob/main/Objects/complexobject.c#L986
    // In the CPython source code, a branch algorithm is used for complex division.
    // It first compares the magnitudes of the dividend and divisor, and if some components are too large or too small, 
    // appropriate scaling is applied before performing the operation. 
    // This approach can significantly reduce overflow or underflow, thereby ensuring that the results remain more consistent with Python.
    div(other) {
        // (a+bi)/(c+di) = ((a+bi)*(c-di)) / (c^2 + d^2)
        const denominator = other.real * other.real + other.imag * other.imag;
        if (denominator === 0) {
            throw new Error(`Division by zero in complex number.`);
        }
        const a = this.real;
        const b = this.imag;
        const c = other.real;
        const d = other.imag;
        const absC = Math.abs(c);
        const absD = Math.abs(d);
        let real;
        let imag;
        if (absD < absC) {
            const ratio = d / c;
            const denom = c + d * ratio; // c + d*(d/c) = c + d^2/c
            real = (a + b * ratio) / denom;
            imag = (b - a * ratio) / denom;
        }
        else {
            const ratio = c / d;
            const denom = d + c * ratio; // d + c*(c/d) = d + c^2/d
            real = (a * ratio + b) / denom;
            imag = (b * ratio - a) / denom;
        }
        return new PyComplexNumber(real, imag);
        //const numerator = this.mul(new PyComplexNumber(other.real, -other.imag));
        //return new PyComplexNumber(numerator.real / denominator, numerator.imag / denominator);
    }
    pow(other) {
        // z = this (a+bi), w = other (A+Bi)
        const a = this.real;
        const b = this.imag;
        const A = other.real;
        const B = other.imag;
        const r = Math.sqrt(a * a + b * b);
        const theta = Math.atan2(b, a);
        if (r === 0) {
            // In Python, raising 0 to a negative or complex power raises an error.
            // For example, 0**(1j) in CPython directly raises ValueError: complex power.
            if (A < 0 || B !== 0) {
                throw new Error('0 cannot be raised to a negative or complex power');
            }
            // Otherwise, 0**(positive number) = 0.
            return new PyComplexNumber(0, 0);
        }
        const logR = Math.log(r);
        // realExpPart = A*ln(r) - B*theta
        // imagExpPart = B*ln(r) + A*theta
        const realExpPart = A * logR - B * theta;
        const imagExpPart = B * logR + A * theta;
        // e^(x + i y) = e^x [cos(y) + i sin(y)]
        const expOfReal = Math.exp(realExpPart);
        const c = expOfReal * Math.cos(imagExpPart);
        const d = expOfReal * Math.sin(imagExpPart);
        return new PyComplexNumber(c, d);
    }
    toString() {
        if (this.real === 0) {
            return `${this.imag}j`;
        }
        // if (this.imag === 0) {
        //     return `${this.real}`;
        // }
        const sign = (this.imag >= 0) ? "+" : "";
        // return `(${this.real}${sign}${this.imag}j)`;
        return `(${this.toPythonComplexFloat(this.real)}${sign}${this.toPythonComplexFloat(this.imag)}j)`;
    }
    toPythonComplexFloat(num) {
        if (num === Infinity) {
            return "inf";
        }
        if (num === -Infinity) {
            return "-inf";
        }
        if (Math.abs(num) >= 1e16 || (num !== 0 && Math.abs(num) < 1e-4)) {
            return num.toExponential().replace(/e([+-])(\d)$/, 'e$10$2');
        }
        return num.toString();
    }
    equals(other) {
        return (Number(this.real) === Number(other.real) && Number(this.imag) === Number(other.imag));
    }
}
exports.PyComplexNumber = PyComplexNumber;
// export class Representation {
//     constructor(public representation: string) {}
//     toString() {
//         return this.representation
//     }
// }
class Representation {
    constructor(representation) {
        this.representation = representation;
    }
    toString(value) {
        // call str(value) in stdlib
        // TODO: mapping
        const result = (0, stdlib_1.toPythonString)(value);
        return result;
    }
}
exports.Representation = Representation;
