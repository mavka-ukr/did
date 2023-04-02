class ASTNode {}
class NumberNode extends ASTNode {}

/**
 * @param {string} code
 * @return {ASTNode}
 */
export function parse(code) {
    return new NumberNode(123);
}
