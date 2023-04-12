import { DictionaryEntryNode, DictionaryNode, EmptyNode, ListNode, LogicalNode, NumberNode, ObjectEntryNode, ObjectNode, TextNode } from "./Nodes.js";
import { parse } from "./main.js";

function position(startPosition, startLine, endPosition, endLine) {
    return {
        startPosition: startPosition,
        startLine: startLine,
        endPosition: endPosition,
        endLine: endLine
    };
}

describe('Parser', () => {
    test('NumberNode', () => {
        expect(parse('1')).toEqual(new NumberNode(position(1, 1, 1, 1), 1));
        expect(parse('-1')).toEqual(new NumberNode(position(1, 1, 2, 1), -1));
        expect(parse('3.14')).toEqual(new NumberNode(position(1, 1, 4, 1), 3.14));
        expect(parse('-3.14')).toEqual(new NumberNode(position(1, 1, 5, 1), -3.14));
    });

    test('LogicalNode', () => {
        expect(parse('так')).toEqual(new LogicalNode(position(1, 1, 3, 1), true));
        expect(parse('ні')).toEqual(new LogicalNode(position(1, 1, 2, 1), false));
    });

    test('EmptyNode', () => {
        expect(parse('пусто')).toEqual(new EmptyNode(position(1, 1, 5, 1)));
    });

    describe('TextNode', () => {
        test('Text', () => {
            expect(parse('"Привіт від Лесі!"')).toEqual(new TextNode(position(1, 1, 18, 1), 'Привіт від Лесі!'));
        });

        const cases = [['"\\0"', '\0'], ['"\\b"', '\b'], ['"\\t"', '\t'], ['"\\n"', '\n'], ['"\\f"', '\f'], ['"\\r"', '\r'], ['"\\""', '"'],
                        ['"\\\'"', '\''], ['"\\\\"', '\\'], ['"\\a"', '\\a']];
        test.each(cases)('Escape Sequence', (input, result) => {
            expect(parse(input)).toEqual(new TextNode(position(1, 1, input.length, 1), result));
        });
    });

    test('ObjectNode', () => {
        expect(parse('Людина(імʼя="Давид", бути=так)')).toEqual(new ObjectNode(position(1, 1, 30, 1), 'Людина', [
            new ObjectEntryNode(position(8, 1, 19, 1), 'імʼя', new TextNode(position(13, 1, 19, 1), 'Давид')),
            new ObjectEntryNode(position(22, 1, 29, 1), 'бути', new LogicalNode(position(27, 1, 29, 1), true)),
        ]));

        expect(parse('Книга(сторінок=20, автор=Автор(псевдонім="Леся"))')).toEqual(new ObjectNode(position(1, 1, 49, 1), 'Книга', [
            new ObjectEntryNode(position(7, 1, 17, 1), 'сторінок', new NumberNode(position(16, 1, 17, 1), 20)),
            new ObjectEntryNode(position(20, 1, 48, 1), 'автор', new ObjectNode(position(26, 1, 48, 1), 'Автор', [
                new ObjectEntryNode(position(32, 1, 47, 1), 'псевдонім', new TextNode(position(42, 1, 47, 1), 'Леся'))
            ]))
        ]));
    });

    test('ListNode', () => {
        expect(parse('[1, -2, 3.14, "привіт", Людина(імʼя="Давид")]')).toEqual(new ListNode(position(1, 1, 45, 1), [
            new NumberNode(position(2, 1, 2, 1), 1),
            new NumberNode(position(5, 1, 6, 1), -2),
            new NumberNode(position(9, 1, 12, 1), 3.14),
            new TextNode(position(15, 1, 22, 1), 'привіт'),
            new ObjectNode(position(25, 1, 44, 1), 'Людина', [
                new ObjectEntryNode(position(32, 1, 43, 1), 'імʼя', new TextNode(position(37, 1, 43, 1), 'Давид'))
            ]),
        ]));
    });

    test('DictNode', () => {
        expect(parse('(а=2, "б"="2", в=[], г=(), Ґ=Книжка(), 999=238)')).toEqual(new DictionaryNode(position(1, 1, 47, 1), [
            new DictionaryEntryNode(position(2, 1, 4, 1), 'а', new NumberNode(position(4, 1, 4, 1), 2)),
            new DictionaryEntryNode(position(7, 1, 13, 1), new TextNode(position(7, 1, 9, 1), 'б'), new TextNode(position(11, 1, 13, 1), '2')),
            new DictionaryEntryNode(position(16, 1, 19, 1), 'в', new ListNode(position(18, 1, 19, 1), [])),
            new DictionaryEntryNode(position(22, 1, 25, 1), 'г', new DictionaryNode(position(24, 1, 25, 1), [])),
            new DictionaryEntryNode(position(28, 1, 37, 1), 'Ґ', new ObjectNode(position(30, 1, 37, 1), 'Книжка', [])),
            new DictionaryEntryNode(position(40, 1, 46, 1), new NumberNode(position(40, 1, 42, 1), 999), new NumberNode(position(44, 1, 46, 1), 238))
        ]));
    });
});
