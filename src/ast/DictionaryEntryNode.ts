import {Err, Ok} from "../result";
import {tag} from "../util_parsers/basic";
import {alt, map, tuple} from "../util_parsers/combinator";
import {CustomError, IResult, ParseError, Parser} from "../util_parsers/types";
import ASTNode from "./ASTNode";
import {parseASTNode} from "./composite_parsers";
import Context, {whitespaceOffset} from "./Context";
import NumberNode from "./NumberNode";
import {parseIdent} from "./ObjectEntryNode";
import TextNode from "./TextNode";

export default class DictionaryEntryNode extends ASTNode {
    constructor(
        public readonly key: TextNode | NumberNode,
        public readonly value: ASTNode,
        context: Context,
    ) {
        super(context);
    }

    static parse(input: string, context: Context): IResult<[DictionaryEntryNode, Context]> {
        const parseResult = parseEntry(input, context);
        if (parseResult.isErr()) {
            return new Err(new ParseError(
                `dict entry (${parseResult.unwrapErr()})`,
                input,
                new CustomError("DictionaryEntryNode"),
            ));
        }
        const [rest, [key, value, newContext]] = parseResult.unwrap();
        return new Ok([rest, [new DictionaryEntryNode(key, value, context), newContext]]);
    }

    toString(): string {
        return `DictionaryEntryNode({ key: ${this.key}, value: ${this.value} })`;
    }
}

function parseEntry(input: string, context: Context): IResult<[TextNode | NumberNode, ASTNode, Context]> {
    const keyResult = alt(
        map(
            parseIdent,
            ident => [new TextNode(ident, context), context.addColumns(ident.length)],
        ) as Parser<[TextNode | NumberNode, Context]>,
        (i => TextNode.parse(i, context)) as Parser<[TextNode | NumberNode, Context]>,
        (i => NumberNode.parse(i, context)) as Parser<[TextNode | NumberNode, Context]>,
    )(input);
    if (keyResult.isErr()) {
        return new Err(keyResult.unwrapErr());
    }
    let [rest, [key, newContext]] = keyResult.unwrap();

    const sepResult = tuple(whitespaceOffset, tag("="), whitespaceOffset)(rest);
    if (sepResult.isErr()) {
        return new Err(sepResult.unwrapErr());
    }
    const [rest1, [ws1, , ws2]] = sepResult.unwrap();
    newContext = newContext.addRows(ws1.rows).addColumns(ws1.columns + 1).addRows(ws2.rows).addColumns(ws2.columns);

    const valueResult = parseASTNode(rest1, newContext);
    if (valueResult.isErr()) {
        return new Err(valueResult.unwrapErr());
    }
    const [rest2, [value, newContext1]] = valueResult.unwrap();

    return new Ok([rest2, [key, value, newContext1]]);
}
