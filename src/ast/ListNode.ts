import {Err, Ok} from "../result";
import {pair, withError} from "../util_parsers/combinator";
import {CustomError, IResult, ParseError} from "../util_parsers/types";
import ASTNode from "./ASTNode";
import {LEFT_BRACKET, RIGHT_BRACKET} from "./common_parsers";
import {listOfEntries, parseASTNode} from "./composite_parsers";
import Context, {whitespaceOffset} from "./Context";

export default class ListNode extends ASTNode {
    constructor(public readonly entries: ASTNode[], context: Context) {
        super(context);
    }

    static parse(input: string, context: Context): IResult<[ListNode, Context]> {
        const parseResult = parseList(input, context);
        if (parseResult.isErr()) {
            return new Err(new ParseError(
                `список вузлів (${parseResult.unwrapErr()})`,
                input,
                new CustomError("Розбір списку вузлів"),
            ));
        }
        const [rest, [entries, newContext]] = parseResult.unwrap();
        return new Ok([rest, [new ListNode(entries, context), newContext]]);
    }

    toString(): string {
        return `ListNode(${this.entries})`;
    }
}

const LIST_START = pair(LEFT_BRACKET, whitespaceOffset);
const LIST_END = pair(whitespaceOffset, RIGHT_BRACKET);

function parseList(input: string, context: Context): IResult<[ASTNode[], Context]> {
    const parseResult = withError(
        LIST_START,
        new ParseError("[", input, new CustomError("Розбір початку списку")),
    )(input);
    if (parseResult.isErr()) {
        return new Err(parseResult.unwrapErr());
    }
    const [rest, [, offset]] = parseResult.unwrap();
    let newContext = context.addColumns(1).addRows(offset.rows).addColumns(offset.columns);
    const entriesResult = listOfASTNodeEntries(rest, newContext);
    if (entriesResult.isErr()) {
        return new Err(entriesResult.unwrapErr());
    }
    const [rest2, [entries, newContext1]] = entriesResult.unwrap();
    const endResult = withError(
        LIST_END,
        new ParseError("]", rest2, new CustomError("Розбір кінця списку")),
    )(rest2);
    if (endResult.isErr()) {
        return new Err(endResult.unwrapErr());
    }
    const [rest3, [offset2]] = endResult.unwrap();
    newContext = newContext1.addRows(offset2.rows).addColumns(offset2.columns + 1);

    return new Ok([rest3, [entries, newContext]]);
}

function listOfASTNodeEntries(input: string, context: Context): IResult<[ASTNode[], Context]> {
    return listOfEntries(input, context, parseASTNode);
}
