import { TextNode, NumberNode, EmptyNode, LogicalNode, ListNode, DictionaryNode, DictionaryEntryNode, ObjectEntryNode, ObjectNode, parse } from "../src/main.js";
import * as assert from 'assert';

describe("ДІД парсер", () => {

    describe("Тест на роботу NumberNode", () => {
        it("Повинно працювати з цілими числами (позитивні, негативні, нуль, цифри) - 4 тести", () => {
            assert.deepEqual(parse("5"), new NumberNode(5, [1,1], [0,1], [0,1]));
            assert.deepEqual(parse("0"), new NumberNode(0, [1,1], [0,1], [0,1]));
            assert.deepEqual(parse("255"), new NumberNode(255, [1,1], [0,3], [0,3]));
            assert.deepEqual(parse("-25"), new NumberNode(-25, [1,1], [0,3], [0,3]));
        });
        it("Повинно працювати з десятичними числами (позитивні, негативні) - 4 тести", () => {
            assert.deepEqual(parse("3.14"), new NumberNode(3.14, [1,1], [0,4], [0,4]));
            assert.deepEqual(parse("-3.14"), new NumberNode(-3.14, [1,1], [0,5], [0,5]));
            assert.deepEqual(parse("5.0"), new NumberNode(5, [1,1], [0,3], [0,3]));
            assert.deepEqual(parse("-7.5627348"), new NumberNode(-7.5627348, [1,1], [0,10], [0,10]));
        });
    });

    describe("Тест на роботу TextNode", () => {
        it("Повинно працювати із стандартними строками - 2 тести", () => {
            assert.deepEqual(parse('"Привіт!"'), new TextNode("Привіт!", [1,1], [1,8], [1,8]));
            assert.deepEqual(parse('"23123"'), new TextNode("23123", [1,1], [1,6], [1,6]));
        });
    });

    describe("Тест на роботу EmptyNode і LogicalNode", () => {
        it('Повинно працювати із "пусто" - 1 тест', () => {
            assert.deepEqual(parse('пусто'), new EmptyNode([1,1], [0,5], [0,5]));
        });
        it('Повинно працювати із "так" - 1 тест', () => {
            assert.deepEqual(parse('так'), new LogicalNode(true, [1,1], [0,3], [0,3]));
        });
        it('Повинно працювати із "ні" - 1 тест', () => {
            assert.deepEqual(parse('ні'), new LogicalNode(false, [1,1], [0,2], [0,2]));
        });
    });

    describe("Тест на роботу ListNode", () => {
        it('Повинно правильно працювати із стандартними списками - 2 тести', () => {
            assert.deepEqual(parse('[1]'), new ListNode([new NumberNode(1, [1,1], [1,2], [1,2])], [1,1], [0,3], [0,3]));
            assert.deepEqual(parse('["Привіт!", так]'), new ListNode([new TextNode("Привіт!", [1,1], [2,9], [2,9]), new LogicalNode(true, [1,1], [12,15], [12,15])], [1,1], [0,16], [0,16]));
        });
        it('Повинно правильно працювати із пустим списком - 1 тест', () => {
            assert.deepEqual(parse('[]'), new ListNode([], [1,1], [0,2], [0,2]));
        });
        it('Повинно правильно працювати, якщо список розміщений на декількох рядках - 1 тест');
            //assert.deepEqual(parse('[1,/n2]'), new ListNode([new NumberNode(1, [0,0], [1,2], [1,2]), new NumberNode(2, [1,1], [0,1], [2,3])], [1,2], [0,2], [0,5]));
    });

    describe("Тест на роботу DictNode", () => {
        it('Повинно правильно працювати із стандартним словником - 1 тест');
        it('Повинно правильно працювати із пустим словником - 1 тест', () => {
            assert.deepEqual(parse('()'), new DictionaryNode([], [1,1], [0,2], [0,2]));
        });
        it('Повинно правильно працювати, якщо словник розміщений на декількох рядках - 1 тест');
    });

    describe("Тест на роботу ObjectNode", () => {
        it("Повинно правильно працювати із стандартним об'єктом - 1 тест");
        it("Повинно правильно працювати із пустим об'єктом - 1 тест", () => {
            assert.deepEqual(parse('Тест()'), new ObjectNode("Тест", [], [1,1], [0,6], [0,6]));
        });
        it("Повинно правильно працювати, якщо словник розміщений на декількох рядках - 1 тест");
    });

});
