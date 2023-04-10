import ASTNode from "./ASTNode";
import {CustomError, IResult, ParseError} from "../util_parsers/types";
import {Err, Ok} from "../result";
import {tag} from "../util_parsers/basic";
import Context from "./Context";

export default class EmptyNode extends ASTNode {
    constructor(context: Context) {
        super(context);
    }

    static parse(input: string, context: Context): IResult<[EmptyNode, Context]> {
        const parseResult = tag("пусто")(input);
        if (parseResult.isErr()) {
            return new Err(new ParseError("пусто", input, new CustomError("EmptyNode")));
        }
        const [rest] = parseResult.unwrap();
        return new Ok([rest, [new EmptyNode(context), context.addColumns(5)]]);
    }

    toString(): string {
        return `EmptyNode()`;
    }
}