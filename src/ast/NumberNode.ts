import ASTNode, {Context} from "./ASTNode";
import {CustomError, IResult, ParseError} from "../util_parsers/types";
import {recognize, pair, opt, alt, tuple, map} from "../util_parsers/combinator";
import {numeric1, tag} from "../util_parsers/basic";
import {Err, Ok} from "../result";

export default class NumberNode extends ASTNode {
    constructor(public readonly number: number, context: Context) {
        super(context);
    }

    static parse(input: string, context: Context): IResult<[NumberNode, Context]> {
        const parseResult = parseNumber(input);
        if (parseResult.isErr()) {
            return new Err(new ParseError("number", input, new CustomError("NumberNode")))
        }
        const [rest, n] = parseResult.unwrap();
        return new Ok([rest, [new NumberNode(n, context), context.addColumns(input.length - rest.length)]]);
    }

    toString(): string {
        return `NumberNode(${this.number})`;
    }
}

function parseNumber(input: string): IResult<number> {
    return map(
        pair(
            opt(tag("-")),
            alt(
                map(recognize(tuple(numeric1, tag("."), numeric1)), Number.parseFloat),
                map(recognize(numeric1), Number.parseInt)
            )
        ),
        ([sign, n]) => sign ? -n : n
    )(input);
}