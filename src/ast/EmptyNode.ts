import ASTNode, {Context} from "./ASTNode";
import {CustomError, IResult, ParseError} from "../util_parsers/types";
import {Err, Ok} from "../result";
import {tag} from "../util_parsers/basic";

export default class EmptyNode extends ASTNode {
    constructor(context: Context) {
        super(context);
    }

    static parse(input: string, context: Context): IResult<[EmptyNode, Context]> {
        const parseResult = tag("пусто")(input);
        if (parseResult.isErr()) {
            return new Err(new ParseError("пусто", input, new CustomError("EmptyNode")))
        }
        const [rest, _] = parseResult.unwrap();
        return new Ok([rest, [new EmptyNode(context), context.add(5, 0)]]);
    }

    toString(): string {
        return `EmptyNode()`;
    }
}