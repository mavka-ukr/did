import ASTNode from "./ASTNode";
import {CustomError, IResult, ParseError} from "../util_parsers/types";
import {Err, Ok} from "../result";
import {noneOf, oneOf, tag} from "../util_parsers/basic";
import {alt, delimited, many0, map, preceded, value, withError} from "../util_parsers/combinator";
import Context from "./Context";

export default class TextNode extends ASTNode {
    constructor(public readonly text: string, context: Context) {
        super(context);
    }

    static parse(input: string, context: Context): IResult<[TextNode, Context]> {
        const parseResult = stringLiteral(input);
        if (parseResult.isErr()) {
            return new Err(new ParseError(
                `текст (${parseResult.unwrapErr().toString()})`,
                input,
                new CustomError("Розбір текстового вузла"),
            ));
        }
        const [rest, n] = parseResult.unwrap();
        return new Ok([rest, [new TextNode(n, context), context.addColumns(input.length - rest.length)]]);
    }

    toString(): string {
        return `TextNode("${this.text}")`;
    }
}

const escapedLineFeed = preceded(tag("\\"), tag("n"));
const escapedCarriageReturn = preceded(tag("\\"), tag("r"));
const allowedChars = noneOf("\"\\n\\r\\\\");
const escapedChar = preceded(tag("\\"), oneOf("\"t\\\\"));
const stringWithoutQuotes = many0(alt(
    value(escapedLineFeed, "\n"),
    value(escapedCarriageReturn, "\r"),
    map(escapedChar, char =>
        ({
            "\"": "\"",
            "t": "\t",
            "\\": "\\",
        })[char],
    ),
    allowedChars,
));

const stringLiteral = map(
    delimited(
        i => withError(
            tag("\""),
            new ParseError('"', i, new CustomError("Розбір початку текстового вузла")),
        )(i),
        stringWithoutQuotes,
        i => withError(
            tag("\""),
            new ParseError('"', i, new CustomError("Розбір кінця текстового вузла")),
        )(i),
    ),
    (chars) => chars.join(""),
);
