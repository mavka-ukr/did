import { Token, TokenType, Tokenizer } from "./Tokenizer.js"

describe('Tokenizer', () => {
    const EOF = new Token(TokenType.EOF, "", null);

    describe('Number', () => {
        test('Integer', () => {
            expect(new Tokenizer('0').tokenize()).toEqual([new Token(TokenType.NUMBER, '0', {startPosition: 1, endPosition: 1, line: 1}), EOF]);
            expect(new Tokenizer('1').tokenize()).toEqual([new Token(TokenType.NUMBER, '1', {startPosition: 1, endPosition: 1, line: 1}), EOF]);
            expect(new Tokenizer('-1').tokenize()).toEqual([new Token(TokenType.NUMBER, '-1', {startPosition: 1, endPosition: 2, line: 1}), EOF]);
        });

        test('Float', () => {
            expect(new Tokenizer('3.14').tokenize()).toEqual([new Token(TokenType.NUMBER, '3.14', {startPosition: 1, endPosition: 4, line: 1}), EOF]);
            expect(new Tokenizer('-3.14').tokenize()).toEqual([new Token(TokenType.NUMBER, '-3.14', {startPosition: 1, endPosition: 5, line: 1}), EOF]);
            expect(() => new Tokenizer('-.14').tokenize()).toThrow('Неправильний формат числа. Рядок 1 стовпець 1');
            expect(() => new Tokenizer('.14').tokenize()).toThrow('Неправильний формат числа. Рядок 1 стовпець 1');
            expect(() => new Tokenizer('-3.').tokenize()).toThrow('Неправильний формат числа. Рядок 1 стовпець 1');
            expect(() => new Tokenizer('3.').tokenize()).toThrow('Неправильний формат числа. Рядок 1 стовпець 1');
        });
    });

    describe('Text', () => {
        test.each(['тест', 'Тест', 'Test', 'ім\'я', 'імʼя', '_тест', 'так', 'ні', 'пусто'])('Text', (text) => {
            expect(new Tokenizer(text).tokenize()).toEqual(
                [new Token(TokenType.TEXT, text, {startPosition: 1, endPosition: text.length, line: 1}), EOF]);
        });

        test('Starts with a number', () => {
            expect(() => new Tokenizer('1test').tokenize()).toThrow('Ідентифікатор не може починатись числом. Рядок 1 стовпець 1');
            expect(() => new Tokenizer('-1test').tokenize()).toThrow('Ідентифікатор не може починатись числом. Рядок 1 стовпець 1');
            expect(() => new Tokenizer('-3.14test').tokenize()).toThrow('Ідентифікатор не може починатись числом. Рядок 1 стовпець 1');
        });
    });

    describe('String', () => {
        test('Text', () => {
            const text = '"Привіт від Лесі!"';
            expect(new Tokenizer(text).tokenize()).toEqual([new Token(TokenType.STRING, text, {startPosition: 1, endPosition: text.length, line: 1}), EOF]);
        });

        test('New line', () => {
            expect(() => new Tokenizer('"test\ntest"').tokenize()).toThrow('Відсутні закриваючі лапки. Рядок 1 стовпець 1');
        });
    });
});
