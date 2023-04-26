import {Err, Ok} from "../result";
import {alpha, alphaNumeric, oneOf} from "../util_parsers/basic";
import {alt, many0, map, recognize, tuple, withError} from "../util_parsers/combinator";
import {CustomError, IResult, ParseError} from "../util_parsers/types";
import ASTNode from "./ASTNode";
import {EQUALS_TAG, UNDERSCORE_TAG} from "./common_parsers";
import {parseASTNode} from "./composite_parsers";
import Context, {whitespaceOffset} from "./Context";

export default class ObjectEntryNode extends ASTNode {
    constructor(public readonly key: string, public readonly value: ASTNode, context: Context) {
        super(context);
    }

    static parse(input: string, context: Context): IResult<[ObjectEntryNode, Context]> {
        const parseResult = parseObjectEntry(input, context);
        if (parseResult.isErr()) {
            return new Err(new ParseError(
                `входження об'єкту (${parseResult.unwrapErr()})`,
                input,
                new CustomError("Розбір входження об'єкту"),
            ));
        }
        const [rest, [key, [value, newContext]]] = parseResult.unwrap();
        return new Ok([
            rest,
            [
                new ObjectEntryNode(key, value, context),
                newContext,
            ],
        ]);
    }

    toString(): string {
        return `ObjectEntryNode({ key: "${this.key}", value: ${this.value} })`;
    }
}

const ALPHANUMERIC_OR_UNDERSCORE = many0(alt(alphaNumeric, UNDERSCORE_TAG));
const APOSTROPHE = oneOf("'ʼ");

export const IDENT = recognize(tuple(
    alt(UNDERSCORE_TAG, alpha), // first char must be alpha or underscore
    ALPHANUMERIC_OR_UNDERSCORE, // rest of chars must be alphanumeric or underscore
    many0(tuple(APOSTROPHE, alpha, ALPHANUMERIC_OR_UNDERSCORE)), // optional apostrophes
));

const KEY_AND_EQ = tuple(
    i => withError(
        IDENT,
        new ParseError("ключ входження об'єкту", i, new CustomError("Розбір ключа входження об'єкту")),
    )(i),
    whitespaceOffset,
    i => withError(
        EQUALS_TAG,
        new ParseError("=", i, new CustomError("Розбір '=' між ключем і значенням")),
    )(i),
    whitespaceOffset,
);

function parseObjectEntry(input: string, context: Context): IResult<[string, [ASTNode, Context]]> {
    const keyAndEq = KEY_AND_EQ(input);
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
        i => parseASTNode(i, newContext),
        (value) => [key, value] as [string, [ASTNode, Context]],
    )(rest);
}