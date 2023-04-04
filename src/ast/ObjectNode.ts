import ASTNode, {Context} from "./ASTNode";
import {CustomError, IResult, ParseError} from "../util_parsers/types";
import {Err, Ok} from "../result";
import {pair} from "../util_parsers/combinator";
import ObjectEntryNode, {parseIdent, whitespaceOffset} from "./ObjectEntryNode";
import {tag} from "../util_parsers/basic";

export default class ObjectNode extends ASTNode {
    constructor(
        public readonly ident: string,
        public readonly entries: ASTNode[],
        context: Context
    ) {
        super(context);
    }

    static parse(input: string, context: Context): IResult<[ObjectNode, Context]> {
        const parseResult = parseObject(input, context);
        if (parseResult.isErr()) {
            return new Err(new ParseError(
                `object (${parseResult.unwrapErr()})`,
                input,
                new CustomError("ObjectNode")
            ));
        }
        const [rest, [ident, entries, newContext]] = parseResult.unwrap();
        return new Ok([rest, [new ObjectNode(ident, entries, context), newContext]]);
    }

    toString(): string {
        return `ObjectNode("${this.ident}", [${this.entries.map(e => e.toString()).join(', ')}])`;
    }
}

function parseObject(input: string, context: Context): IResult<[string, ObjectEntryNode[], Context]> {
    const identResult = parseIdent(input);
    if (identResult.isErr()) {
        return new Err(identResult.unwrapErr());
    }
    const [rest, ident] = identResult.unwrap();
    const newContext = context.addColumns(input.length - rest.length);
    const openParenResult = pair(tag('('), whitespaceOffset)(rest);
    if (openParenResult.isErr()) {
        return new Err(openParenResult.unwrapErr());
    }
    const [rest2, [, offset]] = openParenResult.unwrap();
    const newContext2 = newContext.addRows(offset.rows).addColumns(offset.columns);

    const listOfEntriesResult = listOfEntries(rest2, newContext2);
    if (listOfEntriesResult.isErr()) {
        return new Err(listOfEntriesResult.unwrapErr());
    }
    const [rest3, [entries, newContext3]] = listOfEntriesResult.unwrap();
    const closeParenResult = pair(tag(')'), whitespaceOffset)(rest3);
    if (closeParenResult.isErr()) {
        return new Err(closeParenResult.unwrapErr());
    }
    const [rest4, [, offset2]] = closeParenResult.unwrap();
    const newContext4 = newContext3.addRows(offset2.rows).addColumns(offset2.columns);

    return new Ok([rest4, [ident, entries, newContext4]]);
}

function listOfEntries(input: string, context: Context): IResult<[ObjectEntryNode[], Context]> {
    const entries: ObjectEntryNode[] = [];
    let rest = input;
    let newContext = context;
    while (true) {
        const entryResult = ObjectEntryNode.parse(rest, newContext);
        if (entryResult.isErr()) {
            return new Err(entryResult.unwrapErr())
        }
        const [rest2, [entry, newContext1]] = entryResult.unwrap();
        entries.push(entry);
        rest = rest2;
        newContext = newContext1;
        const sepResult = pair(tag(','), whitespaceOffset)(rest);
        if (sepResult.isErr()) {
            break;
        }
        const [rest3, [, offset]] = sepResult.unwrap();
        rest = rest3;
        newContext = newContext.addRows(offset.rows).addColumns(offset.columns);
    }
    return new Ok([rest, [entries, newContext]]);
}
