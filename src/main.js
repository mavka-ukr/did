import { Tokenizer } from "./Tokenizer.js";
import Parser from "./Parser.js";
import { ASTNode } from "./Nodes.js";

/**
 * @param {string} code
 * @return {ASTNode}
 */
export function parse(code) {
    const tokenizer = new Tokenizer(code);
    const parser = new Parser(tokenizer.tokenize());
    return parser.parseRoot();
}
