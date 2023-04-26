import {Err, Ok} from "../result";
import {numeric1, tag} from "../util_parsers/basic";
import {alt, map, opt, pair, recognize, tuple} from "../util_parsers/combinator";
import {CustomError, IResult, ParseError} from "../util_parsers/types";
import ASTNode from "./ASTNode";
import Context from "./Context";

export default class NumberNode extends ASTNode {
    constructor(public readonly number: number, context: Context) {
        super(context);
    }

    static parse(input: string, context: Context): IResult<[NumberNode, Context]> {
        const parseResult = NUMBER(input);
        if (parseResult.isErr()) {
            return new Err(new ParseError("число", input, new CustomError("Розбір числового вузла")));
        }
        const [rest, n] = parseResult.unwrap();
        return new Ok([rest, [new NumberNode(n, context), context.addColumns(input.length - rest.length)]]);
    }

    toString(): string {
        return `NumberNode(${this.number})`;
    }
}

const NUMBER = map(
    pair(
        opt(tag('-')),
        alt(
            map(recognize(tuple(numeric1, tag('.'), numeric1)), Number.parseFloat),
            map(recognize(numeric1), Number.parseInt),
        ),
    ),
    ([sign, n]) => sign
        ? -n
        : n,
);
