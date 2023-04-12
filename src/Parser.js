import { ASTNode, DictionaryEntryNode, DictionaryNode, EmptyNode, ListNode, LogicalNode, NumberNode, ObjectEntryNode, ObjectNode, TextNode } from "./Nodes.js";
import { TokenType, Token } from "./Tokenizer.js"

/**
 * @typedef {import('./Nodes.js').Position} Position
 */

export default class Parser {
    /**
     * @param {Array.<Token>} tokens
     */
    constructor(tokens) {
        this.tokens = tokens;
        this.position = 0; // position in tokens
    }

    /** 
     * @return {ASTNode}
     */
    parseRoot() {
        const root = this.parse();
        if (this.peekToken().tokenType != TokenType.EOF) {
            const badToken = this.peekToken();
            throw `Неправильний синтаксис. Рядок ${badToken.position.line} стовпець ${badToken.position.startPosition}`;
        }
        return root;
    }

    parse() {
        const currentToken = this.peekToken();

        switch (currentToken.tokenType) {
            case TokenType.LPAR: return this.dictNode();
            case TokenType.LSQB: return this.listNode();
            case TokenType.NUMBER:
                this.position++;
                return new NumberNode(Parser.nodePositionFromToken(currentToken), Number(currentToken.text));
            case TokenType.STRING: return this.textNode();
            case TokenType.TEXT: 
                if (this.peekToken(1).tokenType == TokenType.LPAR) return this.objectNode();
                if (currentToken.text == "пусто") {
                    this.position++;
                    return new EmptyNode(Parser.nodePositionFromToken(currentToken));
                }
                if (currentToken.text == "так" || currentToken.text == "ні") {
                    this.position++;
                    return new LogicalNode(Parser.nodePositionFromToken(currentToken), currentToken.text == "так" ? true : false);
                }
                Parser.errorExpected("(", currentToken);
        }

        throw "Немає кореневого елемента";
    }

    dictNode() {
        const lpar = this.matchToken(TokenType.LPAR);
        const dictEntries = [];
        while (true) {
            const rpar = this.matchToken(TokenType.RPAR);
            if (!!rpar) {
                return new DictionaryNode(Parser.nodePositionFromTwoTokens(lpar, rpar), dictEntries);
            }

            dictEntries.push(this.dictEntryNode());
            if (this.matchToken(TokenType.COMMA)) {
                if (this.peekToken().tokenType == TokenType.RPAR) {
                    throw 'Кома перед закриваючим символом заборонена';
                }
            } else if (this.peekToken().tokenType != TokenType.RPAR) {
                Parser.errorExpected(',', this.peekToken());
            }
        }
    }

    dictEntryNode() {
        let key;
        const keyToken = this.peekToken();
        
        switch (keyToken.tokenType) {
            case TokenType.TEXT: key = keyToken.text; this.position++; break;
            case TokenType.STRING: key = this.textNode(); break;
            case TokenType.NUMBER: key = new NumberNode(Parser.nodePositionFromToken(keyToken), Number(keyToken.text)); this.position++; break;
            default:
                throw 'Невірний ключ словника. Ключем може бути назва без лапок, з лапками та число. ' +
                    `Рядок ${badToken.position.line} стовпець ${badToken.position.startPosition}`;
        }

        if (!this.matchToken(TokenType.EQUAL)) {
            Parser.errorExpected("=", this.peekToken());
        }
        const value = this.parse();
        return new DictionaryEntryNode(Parser.nodePositionFromTokenAndNode(keyToken, value), key, value);
    }

    listNode() {
        const lsqb = this.matchToken(TokenType.LSQB);
        const objects = [];
        while (true) {
            const rsqb = this.matchToken(TokenType.RSQB);
            if (!!rsqb) {
                return new ListNode(Parser.nodePositionFromTwoTokens(lsqb, rsqb), objects);
            }

            objects.push(this.parse());
            if (this.matchToken(TokenType.COMMA)) {
                if (this.peekToken().tokenType == TokenType.RSQB) {
                    throw 'Кома перед закриваючим символом заборонена';
                }
            } else if (this.peekToken().tokenType != TokenType.RSQB) {
                Parser.errorExpected(',', this.peekToken());
            }
        }
    }

    textNode() {
        const token = this.matchToken(TokenType.STRING);
        let result = '';

        for (let i = 1; i < token.text.length - 1; i++) {
            const currentChar = token.text[i];
            const nextChar = token.text[i + 1];

            if (currentChar == '\\' && i != token.text.length - 2) {
                switch (nextChar) {
                    case '0': result += '\0'; break;
                    case 'b': result += '\b'; break;
                    case 't': result += '\t'; break;
                    case 'n': result += '\n'; break;
                    case 'f': result += '\f'; break;
                    case 'r': result += '\r'; break;
                    case '"': result += '"'; break;
                    case '\'': result += '\''; break;
                    case '\\': result += '\\'; break;
                    default:
                        result += currentChar + nextChar;
                        break;
                }
                i++; // skip the next character because two characters have already been added
            } else {
                result += currentChar;
            }
        }
        return new TextNode(Parser.nodePositionFromToken(token), result);
    }

    objectNode() {
        const nameToken = this.matchToken(TokenType.TEXT);
        this.matchToken(TokenType.LPAR);

        let objectEntries = [];
        while (true) {
            const rpar = this.matchToken(TokenType.RPAR);
            if (!!rpar) {
                return new ObjectNode(Parser.nodePositionFromTwoTokens(nameToken, rpar), nameToken.text, objectEntries);
            }

            objectEntries.push(this.objectEntryNode());
            if (this.matchToken(TokenType.COMMA)) {
                if (this.peekToken().tokenType == TokenType.RPAR) {
                    throw 'Кома перед закриваючим символом заборонена';
                }
            } else if (this.peekToken().tokenType != TokenType.RPAR) {
                Parser.errorExpected(',', this.peekToken());
            }
        }
    }

    objectEntryNode() {
        const key = this.matchToken(TokenType.TEXT);
        if (!key) {
            const badToken = this.peekToken();
            throw 'Невірний ключ обʼєкту. Ключем може бути лише назва без лапок.' +
                `Рядок ${badToken.position.line} стовпець ${badToken.position.startPosition}`;
        }
        if (!this.matchToken(TokenType.EQUAL)) {
            Parser.errorExpected("=", this.peekToken());
        }
        const value = this.parse();
        return new ObjectEntryNode(Parser.nodePositionFromTokenAndNode(key, value), key.text, value);
    }

    matchToken(expected) {
        const currentToken = this.peekToken();
        if (currentToken.tokenType == expected) {
            this.position++;
            return currentToken;
        }

        return false;
    }

    peekToken(n=0) {
        const index = this.position + n;
        if (index > this.tokens.length) return this.tokens[this.tokens.length - 1];
        return this.tokens[index];
    }

    /**
     * @param {String} expected 
     * @param {Token} token 
     */
    static errorExpected(expected, token) {
        if (token.tokenType == TokenType.EOF) {
            throw `Очікувалась "${expected}". Натомість це кінець коду`;
        }
        throw `Очікувалась "${expected}". Натомість на рядку ${token.position.line} стовпець ${token.position.startPosition} стоїть ${token.text}`;
    }

    /**
     * @param {Token} startToken 
     * @param {ASTNode} endNode
     * @return {Position}
     */
    static nodePositionFromTokenAndNode(startToken, endNode) {
        const tokenPos = startToken.position;
        const nodePos = endNode.position;
        return {
            startPosition: tokenPos.startPosition,
            startLine: tokenPos.line,
            endPosition: nodePos.endPosition,
            endLine: nodePos.endLine
        };
    }

    /**
     * @param {Token} startToken 
     * @param {Token} endToken 
     * @return {Position}
     */
    static nodePositionFromTwoTokens(startToken, endToken) {
        const tokenStartPos = startToken.position;
        const tokenEndPos = endToken.position;
        return {
            startPosition: tokenStartPos.startPosition,
            startLine: tokenStartPos.line,
            endPosition: tokenEndPos.endPosition,
            endLine: tokenEndPos.line
        };
    }

    /**
     * @param {Token} token 
     * @return {Position}
     */
    static nodePositionFromToken(token) {
        const tokenPos = token.position;
        return {
            startPosition: tokenPos.startPosition,
            startLine: tokenPos.line,
            endPosition: tokenPos.endPosition,
            endLine: tokenPos.line
        };
    }
}
