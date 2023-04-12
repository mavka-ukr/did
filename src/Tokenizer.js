const TokenType = {
    TEXT: 0,
    STRING: 1,
    LPAR: 2, // (
    RPAR: 3, // )
    EQUAL: 4,
    NUMBER: 5,
    LSQB: 6, // [
    RSQB: 7, // ]
    COMMA: 8,
    EOF: 9, // End of file
}

class Token {
    /**
     * @param {TokenType} tokenType
     * @param {String} text
     * @param {{startPosition: Number, endPosition: Number, line: Number}} position
     */
    constructor(tokenType, text, position) {
        this.tokenType = tokenType;
        this.text = text;
        this.position = position;
    }
}

const TEXT_START    = new RegExp('[a-zA-Zа-яА-ЯіІїЇєЄґҐ_]');
const TEXT_CONTINUE = new RegExp("^[a-zA-Zа-яА-ЯіІїЇєЄґҐ_0-9ʼ']*");

class Tokenizer {
    constructor(code) {
        this.lines = code.split('\n');
        this.line = 1; // the line that is currently being tokenized
        this.tokens = [];
    }

    /**
     * @return {Array.<Token>}
     */
    tokenize() {
        while (this.lines.length > this.line - 1) {
            this.start = 0;
            this.current = 0;
            this.tokenizeLine();
            this.line++;
        }

        this.tokens.push(new Token(TokenType.EOF, "", null));
        return this.tokens;
    }

    tokenizeLine() {
        while (!this.isAtEnd()) {
            this.start = this.current;
            const c = this.advance();
            
            switch (c) {
                case '(': this.addToken(TokenType.LPAR); break;
                case ')': this.addToken(TokenType.RPAR); break;
                case '[': this.addToken(TokenType.LSQB); break;
                case ']': this.addToken(TokenType.RSQB); break;
                case ',': this.addToken(TokenType.COMMA); break;
                case '=': this.addToken(TokenType.EQUAL); break;
                case '"': this.string(); break;
                case '-':
                    if (!this.isDigit(this.peek())) {
                        throw `Неправильний формат числа. Рядок ${this.line} стовпець ${this.current}`;
                    }
                    this.number();
                    break;
                case ' ':
                case '\r':
                case '\t':
                    // ignore whitespace
                    break;
                
                default:
                    if (TEXT_START.test(c)) {
                        const idContinue = this.currentLine.substring(this.current).match(TEXT_CONTINUE);
                        if (idContinue !== null) {
                            this.current += idContinue[0].length;
                        }
                        this.addToken(TokenType.TEXT);
                        break;
                    }

                    if (this.isDigit(c)) {
                        this.number();
                        break;
                    }

                    if (c == '.' && this.isDigit(this.peek())) {
                        throw `Неправильний формат числа. Рядок ${this.line} стовпець ${this.current}`;
                    }
                    
                    throw `Неправильний синтаксис. Рядок ${this.line} стовпець ${this.current}`;
            }
        }
    }

    string() {
        while (true) {
            if (this.match('\\')) {
                if (this.match('"')) {
                    continue;
                }
            }

            if (this.match('"')) {
                break;
            }
            
            if (this.isAtEnd()) {
                throw `Відсутні закриваючі лапки. Рядок ${this.line} стовпець ${this.start + 1}`;
            }

            this.current++;
        }

        this.addToken(TokenType.STRING);
    }

    isDigit(c) {
        return c >= '0' && c <= '9';
    }

    number() {
        while (this.isDigit(this.peek())) {
            this.advance();
        }

        if (this.peek() == '.') {
            this.advance();
            if (!this.isDigit(this.peek())) {
                throw `Неправильний формат числа. Рядок ${this.line} стовпець ${this.start + 1}`;
            }

            while (this.isDigit(this.peek())) {
                this.advance();
            }
        }

        switch (this.peek()) {
            case '(':
            case ')':
            case '[':
            case ']':
            case ',':
            case '=':
            case ' ':
            case '\r':
            case '\t':
            case '\0':
                break;
            default:
                throw `Ідентифікатор не може починатись числом. Рядок ${this.line} стовпець ${this.start + 1}`;
        }

        this.addToken(TokenType.NUMBER);
    }

    advance() {
        this.current++;
        return this.currentLine.charAt(this.current - 1);
    }

    match(expected) {
        if (this.isAtEnd()) return false;
        if (this.currentLine.charAt(this.current) != expected) return false;
        
        this.current++;
        return true;
    }

    peek() {
        if (this.isAtEnd()) return '\0';
        return this.currentLine.charAt(this.current);
    }

    isAtEnd() {
        return this.current >= this.currentLine.length;
    }

    get currentLine() {
        return this.lines[this.line - 1];
    }

    addToken(tokenType) {
        const text = this.currentLine.substring(this.start, this.current);
        const position = {
            startPosition: this.start + 1,
            endPosition: this.current,
            line: this.line
        };
        this.tokens.push(new Token(tokenType, text, position));
    }
}

export { TokenType, Token, Tokenizer };
