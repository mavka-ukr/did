import Context from "./Context";
import DictionaryEntryNode from "./DictionaryEntryNode";
import DictionaryNode from "./DictionaryNode";
import NumberNode from "./NumberNode";
import {Err, Ok} from "../result";
import {describe} from "@jest/globals";
import {CustomError, ParseError} from "../util_parsers/types";
import LogicalNode from "./LogicalNode";
import EmptyNode from "./EmptyNode";
import TextNode from "./TextNode";
import ObjectEntryNode from "./ObjectEntryNode";
import ObjectNode from "./ObjectNode";
import ListNode from "./ListNode";

describe("AST nodes", () => {
    describe("NumberNode", () => {
        test("parsed from `123`", () => {
            const node = NumberNode.parse("123", new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok(["", [new NumberNode(123, new Context(0, 0)), new Context(0, 3)]]),
            );
        });

        test("parsed from `123.456`", () => {
            const node = NumberNode.parse("123.456", new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok(["", [new NumberNode(123.456, new Context(0, 0)), new Context(0, 7)]]),
            );
        });

        test("parsed from `-123`", () => {
            const node = NumberNode.parse("-123", new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok(["", [new NumberNode(-123, new Context(0, 0)), new Context(0, 4)]]),
            );
        });

        test("parsed from `-123.456`", () => {
            const node = NumberNode.parse("-123.456", new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok(["", [new NumberNode(-123.456, new Context(0, 0)), new Context(0, 8)]]),
            );
        });

        test("failed to parse from `abc`", () => {
            const node = NumberNode.parse("abc", new Context(0, 0));
            expect(node).toStrictEqual(
                new Err(new ParseError("number", "abc", new CustomError("NumberNode"))),
            );
        });
    });

    describe("LogicalNode", () => {
        test("parsed from `так`", () => {
            const node = LogicalNode.parse("так", new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok(["", [new LogicalNode(true, new Context(0, 0)), new Context(0, 3)]]),
            );
        });

        test("parsed from `ні`", () => {
            const node = LogicalNode.parse("ні", new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok(["", [new LogicalNode(false, new Context(0, 0)), new Context(0, 2)]]),
            );
        });

        test("failed to parse from `abc`", () => {
            const node = LogicalNode.parse("abc", new Context(0, 0));
            expect(node).toStrictEqual(
                new Err(new ParseError("logical", "abc", new CustomError("LogicalNode"))),
            );
        });
    });

    describe("EmptyNode", () => {
        test("parsed from `пусто`", () => {
            const node = EmptyNode.parse("пусто", new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok(["", [new EmptyNode(new Context(0, 0)), new Context(0, 5)]]),
            );
        });

        test("failed to parse from `abc`", () => {
            const node = EmptyNode.parse("abc", new Context(0, 0));
            expect(node).toStrictEqual(
                new Err(new ParseError("пусто", "abc", new CustomError("EmptyNode"))),
            );
        });
    });

    describe("TextNode", () => {
        test("parsed from `\"текст\"`", () => {
            const node = TextNode.parse("\"текст\"", new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok(["", [new TextNode("текст", new Context(0, 0)), new Context(0, 7)]]),
            );
        });

        test("parsed from `\"текст\\\"\"`", () => {
            const node = TextNode.parse("\"текст\\\"\"", new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok(["", [new TextNode("текст\"", new Context(0, 0)), new Context(0, 9)]]),
            );
        });

        test("parsed from `\"текст\\\\\"`", () => {
            const node = TextNode.parse("\"текст\\\\\"", new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok(["", [new TextNode("текст\\", new Context(0, 0)), new Context(0, 9)]]),
            );
        });

        test("parsed from `\"текст\\n\"`", () => {
            const node = TextNode.parse("\"текст\\n\"", new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok(["", [new TextNode("текст\n", new Context(0, 0)), new Context(0, 9)]]),
            );
        });

        test("parsed from `\"тек\\nст\"`", () => {
            const node = TextNode.parse("\"тек\\nст\"", new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok(["", [new TextNode("тек\nст", new Context(0, 0)), new Context(0, 9)]]),
            );
        });

        test("parsed from `\"текст\\r\"`", () => {
            const node = TextNode.parse("\"текст\\r\"", new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok(["", [new TextNode("текст\r", new Context(0, 0)), new Context(0, 9)]]),
            );
        });

        test("parsed from `\"тек\\rст\"`", () => {
            const node = TextNode.parse("\"тек\\rст\"", new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok(["", [new TextNode("тек\rст", new Context(0, 0)), new Context(0, 9)]]),
            );
        });

        test("parsed from `\"текст\\t\"`", () => {
            const node = TextNode.parse("\"текст\\t\"", new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok(["", [new TextNode("текст\t", new Context(0, 0)), new Context(0, 9)]]),
            );
        });

        test("parsed from `\"тек\\tст\"`", () => {
            const node = TextNode.parse("\"тек\\tст\"", new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok(["", [new TextNode("тек\tст", new Context(0, 0)), new Context(0, 9)]]),
            );
        });

        test("failed to parse from `abc`", () => {
            const node = TextNode.parse("abc", new Context(0, 0));
            expect(node).toStrictEqual(
                new Err(new ParseError(
                    "text (ParseError(tag): Expected '\"' but got 'abc')",
                    "abc",
                    new CustomError("TextNode"),
                )),
            );
        });

        test("failed to parse from `\"ab\nc\"`", () => {
            const node = TextNode.parse("\"ab\nc\"", new Context(0, 0));
            expect(node).toStrictEqual(
                new Err(new ParseError(
                    "text (ParseError(tag): Expected '\"' but got '\nc\"')",
                    "\"ab\nc\"",
                    new CustomError("TextNode"),
                )),
            );
        });
    });

    describe("ObjectEntryNode", () => {
        test("parsed from `ключ=\"значення\"`", () => {
            const node = ObjectEntryNode.parse("ключ=\"значення\"", new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok([
                    "", [
                        new ObjectEntryNode(
                            "ключ",
                            new TextNode("значення", new Context(0, 5)),
                            new Context(0, 0),
                        ), new Context(0, 15),
                    ],
                ]),
            );
        });

        test("parsed from `ключ=пусто`", () => {
            const node = ObjectEntryNode.parse("ключ=пусто", new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok([
                    "", [
                        new ObjectEntryNode(
                            "ключ",
                            new EmptyNode(new Context(0, 5)),
                            new Context(0, 0),
                        ), new Context(0, 10),
                    ],
                ]),
            );
        });

        test("parsed from `ключ = пусто`", () => {
            const node = ObjectEntryNode.parse("ключ = пусто", new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok([
                    "", [
                        new ObjectEntryNode(
                            "ключ",
                            new EmptyNode(new Context(0, 7)),
                            new Context(0, 0),
                        ), new Context(0, 12),
                    ],
                ]),
            );
        });

        test("parsed from `ключ = \"значення\"`", () => {
            const node = ObjectEntryNode.parse("ключ = \"значення\"", new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok([
                    "", [
                        new ObjectEntryNode(
                            "ключ",
                            new TextNode("значення", new Context(0, 7)),
                            new Context(0, 0),
                        ), new Context(0, 17),
                    ],
                ]),
            );
        });

        test("failed to parse from `=`", () => {
            const node = ObjectEntryNode.parse("=", new Context(0, 0));
            expect(node).toStrictEqual(
                new Err(new ParseError(
                    "object entry (ParseError(alt): Expected 'one of the provided parsers' but got '=')",
                    "=",
                    new CustomError("ObjectEntryNode"),
                )),
            );
        });

        test("failed to parse from `ключ=-10.5`", () => {
            const node = ObjectEntryNode.parse("ключ=-10.5", new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok([
                    "", [
                        new ObjectEntryNode(
                            "ключ",
                            new NumberNode(-10.5, new Context(0, 5)),
                            new Context(0, 0),
                        ), new Context(0, 10),
                    ],
                ]),
            );
        });

        test("failed to parse from `abc`", () => {
            const node = ObjectEntryNode.parse("abc", new Context(0, 0));
            expect(node).toStrictEqual(
                new Err(new ParseError(
                    "object entry (ParseError(tag): Expected '=' but got '')",
                    "abc",
                    new CustomError("ObjectEntryNode"),
                )),
            );
        });

        test("failed to parse from `ключ=значення`", () => {
            const node = ObjectEntryNode.parse("ключ=значення", new Context(0, 0));
            expect(node).toStrictEqual(
                new Err(new ParseError(
                    "object entry (ParseError(alt): Expected 'one of the provided parsers' but got 'значення')",
                    "ключ=значення",
                    new CustomError("ObjectEntryNode"),
                )),
            );
        });

        test("failed to parse from ` ключ=значення`", () => {
            const node = ObjectEntryNode.parse(" ключ=значення", new Context(0, 0));
            expect(node).toStrictEqual(
                new Err(new ParseError(
                    "object entry (ParseError(alt): Expected 'one of the provided parsers' but got ' ключ=значення')",
                    " ключ=значення",
                    new CustomError("ObjectEntryNode"),
                )),
            );
        });
    });

    describe("ObjectNode", () => {
        test("parses from `Людина(ім'я=\"Давид\", бути=так)`", () => {
            const node = ObjectNode.parse(
                "Людина(ім'я=\"Давид\", бути=так)",
                new Context(0, 0),
            );
            expect(node).toStrictEqual(
                new Ok([
                    "", [
                        new ObjectNode(
                            "Людина",
                            [
                                new ObjectEntryNode(
                                    "ім'я",
                                    new TextNode("Давид", new Context(0, 12)),
                                    new Context(0, 7),
                                ),
                                new ObjectEntryNode(
                                    "бути",
                                    new LogicalNode(true, new Context(0, 26)),
                                    new Context(0, 21),
                                ),
                            ],
                            new Context(0, 0),
                        ), new Context(0, 30),
                    ],
                ]),
            );
        });

        test("parses from `Книга(сторінок=20, автор=Автор(псевдонім=\"Леся\"))`", () => {
            const node = ObjectNode.parse(
                "Книга(сторінок=20, автор=Автор(псевдонім=\"Леся\"))",
                new Context(0, 0),
            );
            expect(node).toStrictEqual(
                new Ok([
                    "", [
                        new ObjectNode(
                            "Книга",
                            [
                                new ObjectEntryNode(
                                    "сторінок",
                                    new NumberNode(20, new Context(0, 15)),
                                    new Context(0, 6),
                                ),
                                new ObjectEntryNode(
                                    "автор",
                                    new ObjectNode(
                                        "Автор",
                                        [
                                            new ObjectEntryNode(
                                                "псевдонім",
                                                new TextNode("Леся", new Context(0, 41)),
                                                new Context(0, 31),
                                            ),
                                        ],
                                        new Context(0, 25),
                                    ),
                                    new Context(0, 19),
                                ),
                            ],
                            new Context(0, 0),
                        ), new Context(0, 49),
                    ],
                ]),
            );
        });

        test("parses from `Людина(\n\tім'я=\"Давид\",\n\tбути=так\n)`", () => {
            const node = ObjectNode.parse(
                "Людина(\n\tім'я=\"Давид\",\n\tбути=так\n)",
                new Context(0, 0),
            );
            expect(node).toStrictEqual(
                new Ok([
                    "", [
                        new ObjectNode(
                            "Людина",
                            [
                                new ObjectEntryNode(
                                    "ім'я",
                                    new TextNode("Давид", new Context(1, 6)),
                                    new Context(1, 1),
                                ),
                                new ObjectEntryNode(
                                    "бути",
                                    new LogicalNode(true, new Context(2, 6)),
                                    new Context(2, 1),
                                ),
                            ],
                            new Context(0, 0),
                        ), new Context(3, 1),
                    ],
                ]),
            );
        });

        test(
            "parses from `Книга(\n\tсторінок=20,\n\tавтор=Автор(\n\t\tпсевдонім=\"Леся\"\n\t)\n)`",
            () => {
                const node = ObjectNode.parse(
                    "Книга(\n\tсторінок=20,\n\tавтор=Автор(\n\t\tпсевдонім=\"Леся\"\n\t)\n)",
                    new Context(0, 0),
                );
                expect(node).toStrictEqual(new Ok(
                    [
                        "",
                        [
                            new ObjectNode(
                                "Книга",
                                [
                                    new ObjectEntryNode(
                                        "сторінок",
                                        new NumberNode(20, new Context(1, 10)),
                                        new Context(1, 1),
                                    ),
                                    new ObjectEntryNode(
                                        "автор",
                                        new ObjectNode(
                                            "Автор",
                                            [
                                                new ObjectEntryNode(
                                                    "псевдонім",
                                                    new TextNode("Леся", new Context(3, 12)),
                                                    new Context(3, 2),
                                                ),
                                            ],
                                            new Context(2, 7),
                                        ),
                                        new Context(2, 1),
                                    ),
                                ],
                                new Context(0, 0),
                            ),
                            new Context(5, 1),
                        ],
                    ],
                ));
            },
        );

        test("failed to parse from `Людина(ім'я=\"Давид\", бути=так`", () => {
            const node = ObjectNode.parse(
                "Людина(ім'я=\"Давид\", бути=так",
                new Context(0, 0),
            );
            expect(node).toStrictEqual(
                new Err(new ParseError(
                    "object (ParseError(tag): Expected ')' but got '')",
                    "Людина(ім'я=\"Давид\", бути=так",
                    new CustomError("ObjectNode"),
                )),
            );
        });

        test("parses from `Порожній()`", () => {
            const node = ObjectNode.parse("Порожній()", new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok([
                    "",
                    [
                        new ObjectNode(
                            "Порожній",
                            [],
                            new Context(0, 0),
                        ),
                        new Context(0, 10),
                    ],
                ]),
            );
        });
    });

    describe("DictionaryEntryNode", () => {
        test("parses from `a=2`", () => {
            const node = DictionaryEntryNode.parse("a=2", new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok([
                    "",
                    [
                        new DictionaryEntryNode(
                            new TextNode("a", new Context(0, 0)),
                            new NumberNode(2, new Context(0, 2)),
                            new Context(0, 0),
                        ),
                        new Context(0, 3),
                    ],
                ]),
            );
        });

        test("parses from `\"б\"=\"2\"`", () => {
            const node = DictionaryEntryNode.parse("\"б\"=\"2\"", new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok([
                    "",
                    [
                        new DictionaryEntryNode(
                            new TextNode("б", new Context(0, 0)),
                            new TextNode("2", new Context(0, 4)),
                            new Context(0, 0),
                        ),
                        new Context(0, 7),
                    ],
                ]),
            );
        });

        test("parses from `в=[]`", () => {
            const node = DictionaryEntryNode.parse("в=[]", new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok([
                    "",
                    [
                        new DictionaryEntryNode(
                            new TextNode("в", new Context(0, 0)),
                            new ListNode([], new Context(0, 2)),
                            new Context(0, 0),
                        ),
                        new Context(0, 4),
                    ],
                ]),
            );
        });

        test("parses from `г=()`", () => {
            const node = DictionaryEntryNode.parse("г=()", new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok([
                    "",
                    [
                        new DictionaryEntryNode(
                            new TextNode("г", new Context(0, 0)),
                            new DictionaryNode([], new Context(0, 2)),
                            new Context(0, 0),
                        ),
                        new Context(0, 4),
                    ],
                ]),
            );
        });

        test("parses from `Ґ=Книжка()`", () => {
            const node = DictionaryEntryNode.parse("Ґ=Книжка()", new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok([
                    "",
                    [
                        new DictionaryEntryNode(
                            new TextNode("Ґ", new Context(0, 0)),
                            new ObjectNode("Книжка", [], new Context(0, 2)),
                            new Context(0, 0),
                        ),
                        new Context(0, 10),
                    ],
                ]),
            );
        });

        test("parses from `999=238`", () => {
            const node = DictionaryEntryNode.parse("999=238", new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok([
                    "",
                    [
                        new DictionaryEntryNode(
                            new NumberNode(999, new Context(0, 0)),
                            new NumberNode(238, new Context(0, 4)),
                            new Context(0, 0),
                        ),
                        new Context(0, 7),
                    ],
                ]),
            );
        });
    });

    describe("DictionaryNode", () => {
        test("parses from `()`", () => {
            const node = DictionaryNode.parse("()", new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok([
                    "",
                    [
                        new DictionaryNode([], new Context(0, 0)),
                        new Context(0, 2),
                    ],
                ]),
            );
        });

        test("parses from `(а=2, \"б\"=\"2\", в=[], г=(), Ґ=Книжка(), 999=238)`", () => {
            const node = DictionaryNode.parse(
                "(а=2, \"б\"=\"2\", в=[], г=(), Ґ=Книжка(), 999=238)",
                new Context(0, 0),
            );
            expect(node).toStrictEqual(
                new Ok([
                    "",
                    [
                        new DictionaryNode(
                            [
                                new DictionaryEntryNode(
                                    new TextNode("а", new Context(0, 1)),
                                    new NumberNode(2, new Context(0, 3)),
                                    new Context(0, 1),
                                ),
                                new DictionaryEntryNode(
                                    new TextNode("б", new Context(0, 6)),
                                    new TextNode("2", new Context(0, 10)),
                                    new Context(0, 6),
                                ),
                                new DictionaryEntryNode(
                                    new TextNode("в", new Context(0, 15)),
                                    new ListNode([], new Context(0, 17)),
                                    new Context(0, 15),
                                ),
                                new DictionaryEntryNode(
                                    new TextNode("г", new Context(0, 21)),
                                    new DictionaryNode([], new Context(0, 23)),
                                    new Context(0, 21),
                                ),
                                new DictionaryEntryNode(
                                    new TextNode("Ґ", new Context(0, 27)),
                                    new ObjectNode("Книжка", [], new Context(0, 29)),
                                    new Context(0, 27),
                                ),
                                new DictionaryEntryNode(
                                    new NumberNode(999, new Context(0, 39)),
                                    new NumberNode(238, new Context(0, 43)),
                                    new Context(0, 39),
                                ),
                            ],
                            new Context(0, 0),
                        ),
                        new Context(0, 47),
                    ],
                ]),
            );
        });
    });

    describe("ListNode", () => {
        test("parses from `[]`", () => {
            const node = ListNode.parse("[]", new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok(["", [new ListNode([], new Context(0, 0)), new Context(0, 2)]]),
            );
        });

        test("parses from `[1, 2, 3]`", () => {
            const node = ListNode.parse("[1, 2, 3]", new Context(0, 0));
            expect(node).toStrictEqual(
                new Ok([
                    "",
                    [
                        new ListNode(
                            [
                                new NumberNode(1, new Context(0, 1)),
                                new NumberNode(2, new Context(0, 4)),
                                new NumberNode(3, new Context(0, 7)),
                            ],
                            new Context(0, 0),
                        ),
                        new Context(0, 9),
                    ],
                ]),
            );
        });

        test(
            "parses from `[1, -2, 3.14, \"привіт\", Людина(ім'я=\"Давид\"), (а=2, \"б\"=\"2\", в=[], г=()), [\"2211\"]]`",
            () => {
                const node = ListNode.parse(
                    "[1, -2, 3.14, \"привіт\", Людина(ім'я=\"Давид\"), (а=2, \"б\"=\"2\", в=[], г=()), [\"2211\"]]",
                    new Context(0, 0),
                );
                expect(node).toStrictEqual(
                    new Ok([
                        "",
                        [
                            new ListNode(
                                [
                                    new NumberNode(1, new Context(0, 1)),
                                    new NumberNode(-2, new Context(0, 4)),
                                    new NumberNode(3.14, new Context(0, 8)),
                                    new TextNode("привіт", new Context(0, 14)),
                                    new ObjectNode(
                                        "Людина",
                                        [
                                            new ObjectEntryNode(
                                                "ім'я",
                                                new TextNode("Давид", new Context(0, 36)),
                                                new Context(0, 31),
                                            ),
                                        ],
                                        new Context(0, 24),
                                    ),
                                    new DictionaryNode(
                                        [
                                            new DictionaryEntryNode(
                                                new TextNode("а", new Context(0, 47)),
                                                new NumberNode(2, new Context(0, 49)),
                                                new Context(0, 47),
                                            ),
                                            new DictionaryEntryNode(
                                                new TextNode("б", new Context(0, 52)),
                                                new TextNode("2", new Context(0, 56)),
                                                new Context(0, 52),
                                            ),
                                            new DictionaryEntryNode(
                                                new TextNode("в", new Context(0, 61)),
                                                new ListNode([], new Context(0, 63)),
                                                new Context(0, 61),
                                            ),
                                            new DictionaryEntryNode(
                                                new TextNode("г", new Context(0, 67)),
                                                new DictionaryNode([], new Context(0, 69)),
                                                new Context(0, 67),
                                            ),
                                        ],
                                        new Context(0, 46),
                                    ),
                                    new ListNode(
                                        [new TextNode("2211", new Context(0, 75))],
                                        new Context(0, 74),
                                    ),
                                ],
                                new Context(0, 0),
                            ),
                            new Context(0, 83),
                        ],
                    ]),
                );
            },
        );
    });
});