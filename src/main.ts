import NumberNode from "./ast/NumberNode";

/**
 * @param {string} code
 * @return {ASTNode}
 */
export function parse(code: string) {
    return new NumberNode(123);
}
