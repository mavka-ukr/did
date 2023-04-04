import ASTNode, {Context} from "./ASTNode";
import {CustomError, IResult, ParseError} from "../util_parsers/types";
import {Err, Ok} from "../result";
import {noneOf, oneOf, tag} from "../util_parsers/basic";
import {alt, delimited, many0, map, preceded, value} from "../util_parsers/combinator";

export default class TextNode extends ASTNode {
    constructor(public readonly text: string, context: Context) {
        super(context);
    }

    static parse(input: string, context: Context): IResult<[TextNode, Context]> {
        const parseResult = stringLiteral(input);
        if (parseResult.isErr()) {
            return new Err(new ParseError(
                `text (${parseResult.unwrapErr().toString()})`,
                input,
                new CustomError("TextNode")
            ));
        }
        const [rest, n] = parseResult.unwrap();
        return new Ok([rest, [new TextNode(n, context), context.addColumns(input.length - rest.length)]]);
    }

    toString(): string {
        return `TextNode("${this.text}")`;
    }
}

const escapedLineFeed = preceded(tag('\\'), tag('n'));
const escapedCarriageReturn = preceded(tag('\\'), tag('r'));
const allowedChars = noneOf('"\\n\\r\\\\');
const escapedChar = preceded(tag('\\'), oneOf('"t\\\\'));
const stringWithoutQuotes = many0(alt(
    value(escapedLineFeed, '\n'),
    value(escapedCarriageReturn, '\r'),
    map(escapedChar, char =>
        ({
            '"': '"',
            't': '\t',
            '\\': '\\',
        })[char]
    ),
    allowedChars
));

const stringLiteral = map(
    delimited(tag('"'), stringWithoutQuotes, tag('"')),
    (chars) => chars.join('')
);
