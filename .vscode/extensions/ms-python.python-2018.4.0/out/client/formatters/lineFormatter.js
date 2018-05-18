"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
const braceCounter_1 = require("../language/braceCounter");
const textBuilder_1 = require("../language/textBuilder");
const textRangeCollection_1 = require("../language/textRangeCollection");
const tokenizer_1 = require("../language/tokenizer");
const types_1 = require("../language/types");
class LineFormatter {
    constructor() {
        this.builder = new textBuilder_1.TextBuilder();
        this.tokens = new textRangeCollection_1.TextRangeCollection([]);
        this.braceCounter = new braceCounter_1.BraceCounter();
        this.text = '';
        this.lineNumber = 0;
    }
    // tslint:disable-next-line:cyclomatic-complexity
    formatLine(document, lineNumber) {
        this.document = document;
        this.lineNumber = lineNumber;
        this.text = document.lineAt(lineNumber).text;
        this.tokens = new tokenizer_1.Tokenizer().tokenize(this.text);
        this.builder = new textBuilder_1.TextBuilder();
        this.braceCounter = new braceCounter_1.BraceCounter();
        if (this.tokens.count === 0) {
            return this.text;
        }
        const ws = this.text.substr(0, this.tokens.getItemAt(0).start);
        if (ws.length > 0) {
            this.builder.append(ws); // Preserve leading indentation.
        }
        for (let i = 0; i < this.tokens.count; i += 1) {
            const t = this.tokens.getItemAt(i);
            const prev = i > 0 ? this.tokens.getItemAt(i - 1) : undefined;
            const next = i < this.tokens.count - 1 ? this.tokens.getItemAt(i + 1) : undefined;
            switch (t.type) {
                case types_1.TokenType.Operator:
                    this.handleOperator(i);
                    break;
                case types_1.TokenType.Comma:
                    this.builder.append(',');
                    if (next && !this.isCloseBraceType(next.type) && next.type !== types_1.TokenType.Colon) {
                        this.builder.softAppendSpace();
                    }
                    break;
                case types_1.TokenType.Identifier:
                    if (prev && !this.isOpenBraceType(prev.type) && prev.type !== types_1.TokenType.Colon && prev.type !== types_1.TokenType.Operator) {
                        this.builder.softAppendSpace();
                    }
                    const id = this.text.substring(t.start, t.end);
                    this.builder.append(id);
                    if (this.keywordWithSpaceAfter(id) && next && this.isOpenBraceType(next.type)) {
                        // for x in ()
                        this.builder.softAppendSpace();
                    }
                    break;
                case types_1.TokenType.Colon:
                    // x: 1 if not in slice, x[1:y] if inside the slice.
                    this.builder.append(':');
                    if (!this.braceCounter.isOpened(types_1.TokenType.OpenBracket) && (next && next.type !== types_1.TokenType.Colon)) {
                        // Not inside opened [[ ... ] sequence.
                        this.builder.softAppendSpace();
                    }
                    break;
                case types_1.TokenType.Comment:
                    // Add space before in-line comment.
                    if (prev) {
                        this.builder.softAppendSpace();
                    }
                    this.builder.append(this.text.substring(t.start, t.end));
                    break;
                case types_1.TokenType.Semicolon:
                    this.builder.append(';');
                    break;
                default:
                    this.handleOther(t, i);
                    break;
            }
        }
        return this.builder.getText();
    }
    // tslint:disable-next-line:cyclomatic-complexity
    handleOperator(index) {
        const t = this.tokens.getItemAt(index);
        const prev = index > 0 ? this.tokens.getItemAt(index - 1) : undefined;
        if (t.length === 1) {
            const opCode = this.text.charCodeAt(t.start);
            switch (opCode) {
                case 61 /* Equal */:
                    if (this.handleEqual(t, index)) {
                        return;
                    }
                    break;
                case 46 /* Period */:
                case 64 /* At */:
                case 33 /* ExclamationMark */:
                    this.builder.append(this.text[t.start]);
                    return;
                case 42 /* Asterisk */:
                    if (prev && this.isKeyword(prev, 'lambda')) {
                        this.builder.softAppendSpace();
                        this.builder.append('*');
                        return;
                    }
                    break;
                default:
                    break;
            }
        }
        else if (t.length === 2) {
            if (this.text.charCodeAt(t.start) === 42 /* Asterisk */ && this.text.charCodeAt(t.start + 1) === 42 /* Asterisk */) {
                if (!prev || (prev.type !== types_1.TokenType.Identifier && prev.type !== types_1.TokenType.Number)) {
                    this.builder.append('**');
                    return;
                }
                if (prev && this.isKeyword(prev, 'lambda')) {
                    this.builder.softAppendSpace();
                    this.builder.append('**');
                    return;
                }
            }
        }
        // Do not append space if operator is preceded by '(' or ',' as in foo(**kwarg)
        if (prev && (this.isOpenBraceType(prev.type) || prev.type === types_1.TokenType.Comma)) {
            this.builder.append(this.text.substring(t.start, t.end));
            return;
        }
        this.builder.softAppendSpace();
        this.builder.append(this.text.substring(t.start, t.end));
        this.builder.softAppendSpace();
    }
    handleEqual(t, index) {
        if (this.isMultipleStatements(index) && !this.braceCounter.isOpened(types_1.TokenType.OpenBrace)) {
            return false; // x = 1; x, y = y, x
        }
        // Check if this is = in function arguments. If so, do not add spaces around it.
        if (this.isEqualsInsideArguments(index)) {
            this.builder.append('=');
            return true;
        }
        return false;
    }
    handleOther(t, index) {
        if (this.isBraceType(t.type)) {
            this.braceCounter.countBrace(t);
            this.builder.append(this.text.substring(t.start, t.end));
            return;
        }
        const prev = index > 0 ? this.tokens.getItemAt(index - 1) : undefined;
        if (prev && prev.length === 1 && this.text.charCodeAt(prev.start) === 61 /* Equal */ && this.isEqualsInsideArguments(index - 1)) {
            // Don't add space around = inside function arguments.
            this.builder.append(this.text.substring(t.start, t.end));
            return;
        }
        if (prev && (this.isOpenBraceType(prev.type) || prev.type === types_1.TokenType.Colon)) {
            // Don't insert space after (, [ or { .
            this.builder.append(this.text.substring(t.start, t.end));
            return;
        }
        if (t.type === types_1.TokenType.Unknown) {
            this.handleUnknown(t);
        }
        else {
            // In general, keep tokens separated.
            this.builder.softAppendSpace();
            this.builder.append(this.text.substring(t.start, t.end));
        }
    }
    handleUnknown(t) {
        const prevChar = t.start > 0 ? this.text.charCodeAt(t.start - 1) : 0;
        if (prevChar === 32 /* Space */ || prevChar === 9 /* Tab */) {
            this.builder.softAppendSpace();
        }
        this.builder.append(this.text.substring(t.start, t.end));
        const nextChar = t.end < this.text.length - 1 ? this.text.charCodeAt(t.end) : 0;
        if (nextChar === 32 /* Space */ || nextChar === 9 /* Tab */) {
            this.builder.softAppendSpace();
        }
    }
    // tslint:disable-next-line:cyclomatic-complexity
    isEqualsInsideArguments(index) {
        // Since we don't have complete statement, this is mostly heuristics.
        // Therefore the code may not be handling all possible ways of the
        // argument list continuation.
        if (index < 1) {
            return false;
        }
        const prev = this.tokens.getItemAt(index - 1);
        if (prev.type !== types_1.TokenType.Identifier) {
            return false;
        }
        const first = this.tokens.getItemAt(0);
        if (first.type === types_1.TokenType.Comma) {
            return true; // Line starts with commma
        }
        const last = this.tokens.getItemAt(this.tokens.count - 1);
        if (last.type === types_1.TokenType.Comma) {
            return true; // Line ends in comma
        }
        if (last.type === types_1.TokenType.Comment && this.tokens.count > 1 && this.tokens.getItemAt(this.tokens.count - 2).type === types_1.TokenType.Comma) {
            return true; // Line ends in comma and then comment
        }
        if (this.document) {
            const prevLine = this.lineNumber > 0 ? this.document.lineAt(this.lineNumber - 1).text : '';
            const prevLineTokens = new tokenizer_1.Tokenizer().tokenize(prevLine);
            if (prevLineTokens.count > 0) {
                const lastOnPrevLine = prevLineTokens.getItemAt(prevLineTokens.count - 1);
                if (lastOnPrevLine.type === types_1.TokenType.Comma) {
                    return true; // Previous line ends in comma
                }
                if (lastOnPrevLine.type === types_1.TokenType.Comment && prevLineTokens.count > 1 && prevLineTokens.getItemAt(prevLineTokens.count - 2).type === types_1.TokenType.Comma) {
                    return true; // Previous line ends in comma and then comment
                }
            }
        }
        for (let i = 0; i < index; i += 1) {
            const t = this.tokens.getItemAt(i);
            if (this.isKeyword(t, 'lambda')) {
                return true;
            }
        }
        return this.braceCounter.isOpened(types_1.TokenType.OpenBrace);
    }
    isOpenBraceType(type) {
        return type === types_1.TokenType.OpenBrace || type === types_1.TokenType.OpenBracket || type === types_1.TokenType.OpenCurly;
    }
    isCloseBraceType(type) {
        return type === types_1.TokenType.CloseBrace || type === types_1.TokenType.CloseBracket || type === types_1.TokenType.CloseCurly;
    }
    isBraceType(type) {
        return this.isOpenBraceType(type) || this.isCloseBraceType(type);
    }
    isMultipleStatements(index) {
        for (let i = index; i >= 0; i -= 1) {
            if (this.tokens.getItemAt(i).type === types_1.TokenType.Semicolon) {
                return true;
            }
        }
        return false;
    }
    keywordWithSpaceAfter(s) {
        return s === 'in' || s === 'return' || s === 'and' ||
            s === 'or' || s === 'not' || s === 'from' ||
            s === 'import' || s === 'except' || s === 'for' ||
            s === 'as' || s === 'is';
    }
    isKeyword(t, keyword) {
        return t.type === types_1.TokenType.Identifier && t.length === keyword.length && this.text.substr(t.start, t.length) === keyword;
    }
}
exports.LineFormatter = LineFormatter;
//# sourceMappingURL=lineFormatter.js.map