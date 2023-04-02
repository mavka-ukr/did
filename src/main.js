class ASTNode {}
class NumberNode extends ASTNode {}

export function parse(code) {
    return new NumberNode(123);
}
