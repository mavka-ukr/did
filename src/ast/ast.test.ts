import NumberNode from "./NumberNode";
import {Context} from "./ASTNode";
import {Err, Ok} from "../result";
import {describe} from "@jest/globals";
import {CustomError, ParseError} from "../util_parsers/types";
import LogicalNode from "./LogicalNode";
import EmptyNode from "./EmptyNode";
import TextNode from "./TextNode";
import ObjectEntryNode from "./ObjectEntryNode";

describe("AST nodes", () => {
    describe("NumberNode", () => {
        test("parsed from `123`", () => {
            const node = NumberNode.parse("123", new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok(["", [new NumberNode(123, new Context(0, 0)), new Context(0, 3)]])
            );
        });

        test("parsed from `123.456`", () => {
            const node = NumberNode.parse("123.456", new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok(["", [new NumberNode(123.456, new Context(0, 0)), new Context(0, 7)]])
            );
        });

        test("parsed from `-123`", () => {
            const node = NumberNode.parse("-123", new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok(["", [new NumberNode(-123, new Context(0, 0)), new Context(0, 4)]])
            );
        });

        test("parsed from `-123.456`", () => {
            const node = NumberNode.parse("-123.456", new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok(["", [new NumberNode(-123.456, new Context(0, 0)), new Context(0, 8)]])
            );
        });

        test("failed to parse from `abc`", () => {
            const node = NumberNode.parse("abc", new Context(0, 0));
            expect(node).toStrictEqual(
                new Err(new ParseError("number", "abc", new CustomError("NumberNode")))
            );
        });
    });

    describe("LogicalNode", () => {
        test("parsed from `так`", () => {
            const node = LogicalNode.parse("так", new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok(["", [new LogicalNode(true, new Context(0, 0)), new Context(0, 3)]])
            );
        });

        test("parsed from `ні`", () => {
            const node = LogicalNode.parse("ні", new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok(["", [new LogicalNode(false, new Context(0, 0)), new Context(0, 2)]])
            );
        });

        test("failed to parse from `abc`", () => {
            const node = LogicalNode.parse("abc", new Context(0, 0));
            expect(node).toStrictEqual(
                new Err(new ParseError("boolean", "abc", new CustomError("LogicalNode")))
            );
        });
    });

    describe("EmptyNode", () => {
        test("parsed from `пусто`", () => {
            const node = EmptyNode.parse("пусто", new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok(["", [new EmptyNode(new Context(0, 0)), new Context(0, 5)]])
            );
        });

        test("failed to parse from `abc`", () => {
            const node = EmptyNode.parse("abc", new Context(0, 0));
            expect(node).toStrictEqual(
                new Err(new ParseError("пусто", "abc", new CustomError("EmptyNode")))
            );
        });
    });

    describe("TextNode", () => {
        test("parsed from `\"текст\"`", () => {
            const node = TextNode.parse('"текст"', new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok(["", [new TextNode("текст", new Context(0, 0)), new Context(0, 7)]])
            );
        });

        test("parsed from `\"текст\\\"\"`", () => {
            const node = TextNode.parse('"текст\\""', new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok(["", [new TextNode('текст"', new Context(0, 0)), new Context(0, 9)]])
            );
        });

        test("parsed from `\"текст\\\\\"`", () => {
            const node = TextNode.parse('"текст\\\\"', new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok(["", [new TextNode('текст\\', new Context(0, 0)), new Context(0, 9)]])
            );
        });

        test("parsed from `\"текст\\n\"`", () => {
            const node = TextNode.parse('"текст\\n"', new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok(["", [new TextNode('текст\n', new Context(0, 0)), new Context(0, 9)]])
            );
        });

        test("parsed from `\"тек\\nст\"`", () => {
            const node = TextNode.parse('"тек\\nст"', new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok(["", [new TextNode('тек\nст', new Context(0, 0)), new Context(0, 9)]])
            );
        });

        test("parsed from `\"текст\\r\"`", () => {
            const node = TextNode.parse('"текст\\r"', new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok(["", [new TextNode('текст\r', new Context(0, 0)), new Context(0, 9)]])
            );
        });

        test("parsed from `\"тек\\rст\"`", () => {
            const node = TextNode.parse('"тек\\rст"', new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok(["", [new TextNode('тек\rст', new Context(0, 0)), new Context(0, 9)]])
            );
        });

        test("parsed from `\"текст\\t\"`", () => {
            const node = TextNode.parse('"текст\\t"', new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok(["", [new TextNode('текст\t', new Context(0, 0)), new Context(0, 9)]])
            );
        });

        test("parsed from `\"тек\\tст\"`", () => {
            const node = TextNode.parse('"тек\\tст"', new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok(["", [new TextNode('тек\tст', new Context(0, 0)), new Context(0, 9)]])
            );
        });

        test("failed to parse from `abc`", () => {
            const node = TextNode.parse("abc", new Context(0, 0));
            expect(node).toStrictEqual(
                new Err(new ParseError(
                    "text (ParseError(tag): Expected '\"' but got 'abc')",
                    "abc",
                    new CustomError("TextNode")
                ))
            );
        });

        test("failed to parse from `\"ab\nc\"`", () => {
            const node = TextNode.parse('"ab\nc"', new Context(0, 0));
            expect(node).toStrictEqual(
                new Err(new ParseError(
                    "text (ParseError(tag): Expected '\"' but got '\nc\"')",
                    '"ab\nc"',
                    new CustomError("TextNode")
                ))
            );
        });
    });

    describe("ObjectEntryNode", () => {
        test('parsed from `ключ="значення"`', () => {
            const node = ObjectEntryNode.parse('ключ="значення"', new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok(["", [new ObjectEntryNode(
                    "ключ",
                    new TextNode("значення", new Context(0, 5)),
                    new Context(0, 0)
                ), new Context(0, 15)]])
            );
        });

        test('parsed from `ключ=пусто`', () => {
            const node = ObjectEntryNode.parse('ключ=пусто', new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok(["", [new ObjectEntryNode(
                    "ключ",
                    new EmptyNode(new Context(0, 5)),
                    new Context(0, 0)
                ), new Context(0, 10)]])
            );
        });

        test('parsed from `ключ = пусто`', () => {
            const node = ObjectEntryNode.parse('ключ = пусто', new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok(["", [new ObjectEntryNode(
                    "ключ",
                    new EmptyNode(new Context(0, 7)),
                    new Context(0, 0)
                ), new Context(0, 12)]])
            );
        });

        test('parsed from `ключ = "значення"`', () => {
            const node = ObjectEntryNode.parse('ключ = "значення"', new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok(["", [new ObjectEntryNode(
                    "ключ",
                    new TextNode("значення", new Context(0, 7)),
                    new Context(0, 0)
                ), new Context(0, 17)]])
            );
        });

        test("failed to parse from `=`", () => {
            const node = ObjectEntryNode.parse("=", new Context(0, 0));
            expect(node).toStrictEqual(
                new Err(new ParseError(
                    "object entry (ParseError(alt): Expected 'one of the provided parsers' but got '=')",
                    "=",
                    new CustomError("ObjectEntryNode")
                ))
            );
        });

        test("failed to parse from `ключ=-10.5`", () => {
            const node = ObjectEntryNode.parse("ключ=-10.5", new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok(["", [new ObjectEntryNode(
                    "ключ",
                    new NumberNode(-10.5, new Context(0, 5)),
                    new Context(0, 0)
                ), new Context(0, 10)]])
            );
        });

        test("failed to parse from `abc`", () => {
            const node = ObjectEntryNode.parse("abc", new Context(0, 0));
            expect(node).toStrictEqual(
                new Err(new ParseError(
                    "object entry (ParseError(tag): Expected '=' but got '')",
                    "abc",
                    new CustomError("ObjectEntryNode")
                ))
            );
        });

        test("failed to parse from `ключ=значення`", () => {
            const node = ObjectEntryNode.parse("ключ=значення", new Context(0, 0));
            expect(node).toStrictEqual(
                new Err(new ParseError(
                    "object entry (ParseError(alt): Expected 'one of the provided parsers' but got 'значення')",
                    "ключ=значення",
                    new CustomError("ObjectEntryNode")
                ))
            );
        });

        test("failed to parse from ` ключ=значення`", () => {
            const node = ObjectEntryNode.parse(" ключ=значення", new Context(0, 0));
            expect(node).toStrictEqual(
                new Err(new ParseError(
                    "object entry (ParseError(alt): Expected 'one of the provided parsers' but got ' ключ=значення')",
                    " ключ=значення",
                    new CustomError("ObjectEntryNode")
                ))
            );
        });
    });
});