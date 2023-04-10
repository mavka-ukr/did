import {Err, Ok} from "../result";
import {tag} from "../util_parsers/basic";
import {alt, pair} from "../util_parsers/combinator";
import {IResult, Parser} from "../util_parsers/types";
import ASTNode from "./ASTNode";
import Context, {whitespaceOffset} from "./Context";
import DictionaryNode from "./DictionaryNode";
import EmptyNode from "./EmptyNode";
import ListNode from "./ListNode";
import LogicalNode from "./LogicalNode";
import NumberNode from "./NumberNode";
import ObjectNode from "./ObjectNode";
import TextNode from "./TextNode";

export function parseASTNode(input: string, context: Context): IResult<[ASTNode, Context]> {
    return alt(
        (i => EmptyNode.parse(i, context)) as Parser<[ASTNode, Context]>,
        (i => LogicalNode.parse(i, context)) as Parser<[ASTNode, Context]>,
        (i => NumberNode.parse(i, context)) as Parser<[ASTNode, Context]>,
        (i => TextNode.parse(i, context)) as Parser<[ASTNode, Context]>,
        (i => ObjectNode.parse(i, context)) as Parser<[ASTNode, Context]>,
        (i => DictionaryNode.parse(i, context)) as Parser<[ASTNode, Context]>,
        (i => ListNode.parse(i, context)) as Parser<[ASTNode, Context]>,
    )(input);
}

export function listOfEntries<T extends ASTNode>(
    input: string,
    context: Context,
    entryParser: (input: string, context: Context) => IResult<[T, Context]>,
): IResult<[T[], Context]> {
    const entries: T[] = [];
    let rest = input;
    let newContext = context;
    while (true) {
        const entryResult = entryParser(rest, newContext);
        if (entryResult.isErr()) {
            if (entries.length === 0) {
                return new Ok([rest, [entries, newContext]]);
            }
            return new Err(entryResult.unwrapErr());
        }
        const [rest2, [entry, newContext1]] = entryResult.unwrap();
        entries.push(entry);
        rest = rest2;
        newContext = newContext1;
        const sepResult = pair(tag(","), whitespaceOffset)(rest);
        if (sepResult.isErr()) {
            break;
        }
        const [rest3, [, offset]] = sepResult.unwrap();
        rest = rest3;
        newContext = newContext.addColumns(1).addRows(offset.rows).addColumns(offset.columns);
    }
    return new Ok([rest, [entries, newContext]]);
}