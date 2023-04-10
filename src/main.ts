import {parseASTNode} from "./ast/composite_parsers";
import Context, {whitespaceOffset} from "./ast/Context";

/**
 * @param {string} code
 * @return {ASTNode}
 * @throws {Error} if the code is invalid
 */
export function parse(code: string) {
    const startResult = whitespaceOffset(code);
    if (startResult.isErr()) {
        throw new Error(startResult.unwrapErr().toString());
    }
    const [rest, offset] = startResult.unwrap();
    const parseResult = parseASTNode(rest, new Context(offset.rows, offset.columns));
    if (parseResult.isErr()) {
        throw new Error(parseResult.unwrapErr().toString());
    }
    let [rest1, [node]] = parseResult.unwrap();
    rest1 = rest1.trimEnd();
    if (rest1.length > 0) {
        throw new Error(`Unexpected trailing characters: ${rest1}`);
    }
    return node;
}
