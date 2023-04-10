import {parseASTNode} from "./ast/composite_parsers";
import Context from "./ast/Context";

/**
 * @param {string} code
 * @return {ASTNode}
 */
export function parse(code: string) {
    const parseResult = parseASTNode(code, new Context(0, 0));
    if (parseResult.isErr()) {
        throw new Error(parseResult.unwrapErr().toString());
    }
    const [rest, [node]] = parseResult.unwrap();
    if (rest.length > 0) {
        throw new Error(`Unexpected trailing characters: ${rest}`);
    }
    return node;
}
