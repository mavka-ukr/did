import ASTNode from "./ASTNode";
import {CustomError, IResult, ParseError} from "../util_parsers/types";
import {tag} from "../util_parsers/basic";
import {alt, value} from "../util_parsers/combinator";
import {Err, Ok} from "../result";
import Context from "./Context";

export default class LogicalNode extends ASTNode {
    constructor(public readonly value: boolean, context: Context) {
        super(context);
    }

    static parse(input: string, context: Context): IResult<[LogicalNode, Context]> {
        const parseResult = parseBool(input);
        if (parseResult.isErr()) {
            return new Err(new ParseError("logical", input, new CustomError("LogicalNode")));
        }
        const [rest, n] = parseResult.unwrap();
        return new Ok([rest, [new LogicalNode(n, context), context.addColumns(input.length - rest.length)]]);
    }

    toString(): string {
        return `LogicalNode(${this.value})`;
    }
}

function parseBool(input: string): IResult<boolean> {
    return alt(
        value(tag("так"), true),
        value(tag("ні"), false),
    )(input);
}