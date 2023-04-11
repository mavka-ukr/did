import ASTNode from "./ast/ASTNode";
import Context, {whitespaceOffset} from "./ast/Context";
import DictionaryNode from "./ast/DictionaryNode";
import EmptyNode from "./ast/EmptyNode";
import ListNode from "./ast/ListNode";
import LogicalNode from "./ast/LogicalNode";
import NumberNode from "./ast/NumberNode";
import ObjectNode from "./ast/ObjectNode";
import TextNode from "./ast/TextNode";
import {Err, Ok} from "./result";
import {CustomError, IResult, ParseError} from "./util_parsers/types";

/**
 * @param {string} code
 * @return {ASTNode}
 * @throws {Error} if the code is invalid
 */
export function parse(code: string): ASTNode {
    const startResult = whitespaceOffset(code);
    if (startResult.isErr()) {
        throw new Error(startResult.unwrapErr().toString());
    }
    const [rest, offset] = startResult.unwrap();
    const parseResult = parseAST(rest, new Context(offset.rows, offset.columns));
    if (parseResult.isErr()) {
        throw new Error(parseResult.unwrapErr().toString());
    }
    let [rest1, node] = parseResult.unwrap();
    rest1 = rest1.trimEnd();
    if (rest1.length > 0) {
        throw new Error(`Unexpected trailing characters: ${rest1}`);
    }
    return node;
}

function parseAST(input: string, context: Context): IResult<ASTNode> {
    const emptyResult = EmptyNode.parse(input, context) as IResult<[ASTNode, Context]>;
    if (emptyResult.isOk()) {
        const [rest, [emptyNode]] = emptyResult.unwrap();
        return new Ok([rest, emptyNode]);
    }
    const logicalResult = LogicalNode.parse(input, context) as IResult<[ASTNode, Context]>;
    if (logicalResult.isOk()) {
        const [rest, [logicalNode]] = logicalResult.unwrap();
        return new Ok([rest, logicalNode]);
    }
    const numberResult = NumberNode.parse(input, context) as IResult<[ASTNode, Context]>;
    if (numberResult.isOk()) {
        const [rest, [numberNode]] = numberResult.unwrap();
        return new Ok([rest, numberNode]);
    }
    const textResult = TextNode.parse(input, context) as IResult<[ASTNode, Context]>;
    if (textResult.isOk()) {
        const [rest, [textNode]] = textResult.unwrap();
        return new Ok([rest, textNode]);
    }
    const objectResult = ObjectNode.parse(input, context) as IResult<[ASTNode, Context]>;
    if (objectResult.isOk()) {
        const [rest, [objectNode]] = objectResult.unwrap();
        return new Ok([rest, objectNode]);
    }
    const dictResult = DictionaryNode.parse(input, context) as IResult<[ASTNode, Context]>;
    if (dictResult.isOk()) {
        const [rest, [dictNode]] = dictResult.unwrap();
        return new Ok([rest, dictNode]);
    }
    const listResult = ListNode.parse(input, context) as IResult<[ASTNode, Context]>;
    if (listResult.isOk()) {
        const [rest, [listNode]] = listResult.unwrap();
        return new Ok([rest, listNode]);
    }
    const message: string = [
        "Якщо ви збиралися написати порожній вузол, то він повинен бути 'пусто'.",
        "Якщо ви збиралися написати логічне значення, то воно повинно бути 'так' або 'ні'.",
        "Якщо ви збиралися написати число, то воно повинно бути десятичне, можливо від'ємне, можливо дробове.",
        "Якщо ви збиралися написати текст, то він повинен бути у лапках, без явного перенесення рядка (замість нього '\\n').",
        `Якщо ви збиралися написати об'єкт, то він повинен виглядати як 'Назва(ключ="значення")': ${objectResult.unwrapErr()}`,
        `Якщо ви збиралися написати словник, то він повинен виглядати як '(ключ="занчення")': ${dictResult.unwrapErr()}`,
        `Якщо ви збиралися написати список, то він повинен виглядати як '["елемент"]': ${listResult.unwrapErr()}`,
    ].join('\n');
    return new Err(new ParseError("правильний синтаксис", input, new CustomError(message)));
}
