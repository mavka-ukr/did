import ASTNode, {Context} from "./ASTNode";
import {Err, Ok} from "../result";
import {CustomError, IResult, ParseError, Parser} from "../util_parsers/types";
import {alt, many0, map, recognize, tuple} from "../util_parsers/combinator";
import {alpha, alphaNumeric, tag, whitespace0} from "../util_parsers/basic";
import NumberNode from "./NumberNode";
import LogicalNode from "./LogicalNode";
import EmptyNode from "./EmptyNode";
import TextNode from "./TextNode";
import ObjectNode from "./ObjectNode";

export default class ObjectEntryNode extends ASTNode {
    constructor(public readonly key: string, public readonly value: ASTNode, context: Context) {
        super(context);
    }

    static parse(input: string, context: Context): IResult<[ObjectEntryNode, Context]> {
        const parseResult = parseObjectEntry(input, context);
        if (parseResult.isErr()) {
            return new Err(new ParseError(
                `object entry (${parseResult.unwrapErr()})`,
                input,
                new CustomError("ObjectEntryNode")
            ));
        }
        const [rest, [key, [value, newContext]]] = parseResult.unwrap();
        return new Ok([
            rest,
            [
                new ObjectEntryNode(key, value, context),
                newContext
            ]
        ]);
    }

    toString(): string {
        return `ObjectEntryNode({ key: "${this.key}", value: ${this.value} })`;
    }
}

export function parseIdent(input: string): IResult<string> {
    return recognize(tuple(
        alt(tag('_'), alpha), // first char must be alpha or underscore
        alphaNumericOrUnderscore0, // rest of chars must be alphanumeric or underscore
        many0(tuple(tag('\''), alpha, alphaNumericOrUnderscore0)) // optional apostrophes
    ))(input);
}

function alphaNumericOrUnderscore0(input: string): IResult<string[]> {
    return many0(alt(alphaNumeric, tag('_')))(input);
}

type Offset = { columns: number, rows: number };

export function whitespaceOffset(input: string): IResult<Offset> {
    return map(whitespace0, ws => {
        const split = ws.split(/\n|(\r\n)/);
        return {columns: split.length - 1, rows: split[split.length - 1].length};
    })(input);
}

function parseObjectEntry(input: string, context: Context): IResult<[string, [ASTNode, Context]]> {
    const keyAndEq = tuple(
        parseIdent, whitespaceOffset, tag('='), whitespaceOffset,
    )(input);
    if (keyAndEq.isErr()) {
        return new Err(keyAndEq.unwrapErr());
    }
    const [rest, [key, ws1, , ws2]] = keyAndEq.unwrap();
    const newContext = context
        .addColumns(key.length)
        .addRows(ws1.rows)
        .addColumns(ws1.columns + 1)
        .addRows(ws2.rows)
        .addColumns(ws2.columns);
    return map(
        alt(
            (i => NumberNode.parse(i, newContext)) as Parser<[ASTNode, Context]>,
            (i => LogicalNode.parse(i, newContext)) as Parser<[ASTNode, Context]>,
            (i => EmptyNode.parse(i, newContext)) as Parser<[ASTNode, Context]>,
            (i => TextNode.parse(i, newContext)) as Parser<[ASTNode, Context]>,
            (i => ObjectNode.parse(i, newContext)) as Parser<[ASTNode, Context]>,
            // TODO: add array parser
        ),
        (value) => [key, value] as [string, [ASTNode, Context]]
    )(rest);
}