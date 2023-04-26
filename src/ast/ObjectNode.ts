import {Err, Ok} from "../result";
import {withError} from "../util_parsers/combinator";
import {CustomError, IResult, ParseError} from "../util_parsers/types";
import ASTNode from "./ASTNode";
import {listOfEntries} from "./composite_parsers";
import Context from "./Context";
import {DICTIONARY_END, DICTIONARY_START} from "./DictionaryNode";
import ObjectEntryNode, {IDENT} from "./ObjectEntryNode";

export default class ObjectNode extends ASTNode {
    constructor(
        public readonly ident: string,
        public readonly entries: ObjectEntryNode[],
        context: Context,
    ) {
        super(context);
    }

    static parse(input: string, context: Context): IResult<[ObjectNode, Context]> {
        const parseResult = parseObject(input, context);
        if (parseResult.isErr()) {
            return new Err(new ParseError(
                `об'єкт (${parseResult.unwrapErr()})`,
                input,
                new CustomError("Розбір об'єкту"),
            ));
        }
        const [rest, [ident, entries, newContext]] = parseResult.unwrap();
        return new Ok([rest, [new ObjectNode(ident, entries, context), newContext]]);
    }

    toString(): string {
        return `ObjectNode("${this.ident}", [${this.entries.map(e => e.toString()).join(", ")}])`;
    }
}


function parseObject(input: string, context: Context): IResult<[string, ObjectEntryNode[], Context]> {
    const identResult = withError(
        IDENT,
        new ParseError("назва об'єкту", input, new CustomError("Розбір назви об'єкту")),
    )(input);
    if (identResult.isErr()) {
        return new Err(identResult.unwrapErr());
    }
    const [rest, ident] = identResult.unwrap();
    const newContext = context.addColumns(ident.length);
    const openParenResult = withError(
        DICTIONARY_START,
        new ParseError("(", rest, new CustomError("Розбір початку тіла об'єкту")),
    )(rest);
    if (openParenResult.isErr()) {
        return new Err(openParenResult.unwrapErr());
    }
    const [rest2, [, offset]] = openParenResult.unwrap();
    const newContext2 = newContext.addColumns(1).addRows(offset.rows).addColumns(offset.columns);

    const listOfEntriesResult = listOfObjectEntryNodeEntries(rest2, newContext2);
    if (listOfEntriesResult.isErr()) {
        return new Err(listOfEntriesResult.unwrapErr());
    }
    const [rest3, [entries, newContext3]] = listOfEntriesResult.unwrap();
    const closeParenResult = withError(
        DICTIONARY_END,
        new ParseError(")", rest3, new CustomError("Розбір кінця тіла об'єкту")),
    )(rest3);
    if (closeParenResult.isErr()) {
        return new Err(closeParenResult.unwrapErr());
    }
    const [rest4, [offset2]] = closeParenResult.unwrap();
    const newContext4 = newContext3.addRows(offset2.rows).addColumns(offset2.columns + 1);

    return new Ok([rest4, [ident, entries, newContext4]]);
}

function listOfObjectEntryNodeEntries(input: string, context: Context): IResult<[ObjectEntryNode[], Context]> {
    return listOfEntries(input, context, ObjectEntryNode.parse);
}
