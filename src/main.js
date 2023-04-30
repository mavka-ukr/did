// Parent class for all of the AST nodes, "column" and "line" is a list with a first column or line that element
// occupies (inclusive) and the last one (exclusive). Because column counter resets to zero with each new line,
// it might be hard to access a particular splice, so you can use "char" counter, which never resets.
// Both "column" and "char" are 0-indexed, while "line" is 1-indexed
export class ASTNode {
  constructor(line, column, char) {
    this.line = line;
    this.column = column;
    this.char = char;
  }
}

// Number node, contains JS number as value
export class NumberNode extends ASTNode {
  constructor(value, line, column, char) {
    super(line, column, char);
    this.value = value;
  }
}

// Text node, contains JS string as value
export class TextNode extends ASTNode {
  constructor(value, line, column, char) {
    super(line, column, char);
    this.value = value
  } 
}

// Logical (Boolean) node, contains true for "так" and false for "ні" as value
export class LogicalNode extends ASTNode {
  constructor(value, line, column, char) {
    super(line, column, char);
    this.value = value;
  }
}


// Empty node, "пусто"
export class EmptyNode extends ASTNode {
  constructor(line, column, char) {
    super(line, column, char);
  }
}

// List node, contains a list of other nodes as contents and total lenght
export class ListNode extends ASTNode {
  constructor(contents, line, column, char) {
    super(line, column, char);
    this.contents = contents;
    this.length = contents.length;
  }
}

// Dictionary node, contains a list of DictionaryEntryNode() as contents and total lenght
export class DictionaryNode extends ASTNode {
  constructor(contents, line, column, char) {
    super(line, column, char);
    this.contents = contents;
    this.length = contents.length;
  }
}

// Dictionary entry node, contains a dictionary key in a format of TextNode and value as another node
export class DictionaryEntryNode extends ASTNode {
  constructor(key, value, line, column, char) {
    super(line, column, char);
    this.key = key;
    this.value = value;
  }
}

// Object node, contains a list of ObjectEntryNode() as contents and total lenght
export class ObjectNode extends ASTNode {
  constructor(name, contents, line, column, char) {
    super(line, column, char);
    this.name = name;
    this.contents = contents;
    this.length = contents.length;
  }
}

// Object entry node, contains an object key in a format of TextNode and value as another node
export class ObjectEntryNode extends ASTNode {
  constructor(key, value, line, column, char) {
    super(line, column, char);
    this.key = key;
    this.value = value;
  }
}

// Main function parse(), accepts a ДІД string
export function parse(str) {
  let i = 0;
  let line = 1;
  let column = 0;

  // parsing given data as any other value, that way parser works for any root data type
  // expecting an end of input right after main object
  const value = parseValue();
  expectEndOfInput();
  return value;

  // function for parsing dictionary
  function parseDictionary() {
    let initialColumn = column;
    let initialLine = line;
    let starting_i = i;
    if (str[i] === "(") {
      i++; column++;
      skipWhitespace();

      const result = [];

      let initial = true;
      // if it is not ')',
      // we take the path of key -> whitespace -> '=' -> whitespace -> value -> ...
      while (i < str.length && str[i] !== ")") {
        if (!initial) {
          eatComma();
          skipWhitespace();
        }
        let dn_scolumn = column;
        let dn_sline = line;
        let dn_si = i;
        let key =
          parseText() ??
          parseNumber();
        if (key === undefined) {
          key=parseKey()
          if (key === undefined) {
            expectDictionaryKey();
          }
        }
        skipWhitespace();
        eatEqualitySign();
        const value = parseValue();
        result.push(new DictionaryEntryNode(key, value, [dn_sline, line], [dn_scolumn, column], [dn_si, i]))
        initial = false;
      }
      expectNotEndOfInput(")");

      // move to the next character of ')'
      i++; column++;

      return new DictionaryNode(result, [initialLine, line], [initialColumn, column], [starting_i, i]);
    }
  }

  // function for parsing a list
  function parseList() {
    let initialColumn = column;
    let initialLine = line;
    let starting_i = i;
    if (str[i] === "[") {
      i++; column++;
      skipWhitespace();

      const result = [];
      let initial = true;
      while (i < str.length && str[i] !== "]") {
        if (!initial) {
          eatComma();
        }
        const value = parseValue();
        result.push(value);
        initial = false;
      }
        expectNotEndOfInput("]");

        // move to the next character of ']'
        i++; column++;

        return new ListNode(result, [initialLine, line], [initialColumn, column], [starting_i, i]);
    }
  }

  // function for parsing a value, so anything except a key
  function parseValue() {
    skipWhitespace();
    let initialColumn = column;
    let starting_i = i;
    const value =
      parseText() ??
      parseNumber() ??
      parseDictionary() ??
      parseList() ??
      parseObject() ??
      parseKeyword("так", new LogicalNode(true, [line, line], [initialColumn, initialColumn+3], [starting_i, starting_i+3])) ??
      parseKeyword("ні", new LogicalNode(false, [line, line], [initialColumn, initialColumn+2], [starting_i, starting_i+2])) ??
      parseKeyword("пусто", new EmptyNode([line, line], [initialColumn, initialColumn+5], [starting_i, starting_i+5]));
    skipWhitespace();
    return value;
  }

  // function to parse an object
  function parseObject() {
    let objectName = "";
    let initialColumn = column;
    let initialLine = line;
    let starting_i = i;
    while (i < str.length && str[i] !== '=' && /^[a-zA-Zа-яА-ЯіІїЇʼ'єЄґҐ_0-9]+$/.test(str[i])) {
      objectName += str[i];
      i++; column++;
    }
    if (str[i] === "(") {
      i++; column++;
      skipWhitespace();

      const result = [];

      let initial = true;
      // if it is not ')',
      // we take the path of key -> whitespace -> '=' -> whitespace -> value -> ...
      while (i < str.length && str[i] !== ")") {
        if (!initial) {
          eatComma();
          skipWhitespace();
        }
        let on_scolumn = column;
        let on_sline = line;
        let on_si = i;
        const key = parseKey();
        if (key === undefined) {
          expectObjectKey();
        }
        skipWhitespace();
        eatEqualitySign();
        const value = parseValue();
        result.push(new ObjectEntryNode(key, value, [on_sline, line], [on_scolumn, column], [on_si, i]))
        initial = false;
      }
      expectNotEndOfInput(")");

      // move to the next character of ')'
      i++; column++;

      return new ObjectNode(objectName, result, [initialLine, line], [initialColumn, column], [starting_i, i]);
    } else {
      line = initialLine; column = initialColumn; i = starting_i; 
    }
  }

  // function for parsing keywords, "name" is the keyword and "value" is
  // what to return when the keyword is encountered
  function parseKeyword(name, value) {
    if (str.slice(i, i + name.length) === name) {
      i += name.length; column += name.length;
      return value;
    }
  }
  
  // skipping any number of whitespaces and some other characters, like newline
  function skipWhitespace() {
    while (
      str[i] === " " ||
      str[i] === "\n" ||
      str[i] === "\t" ||
      str[i] === "\r"
    ) {
      if (str[i] === "\n") {
        line ++; column = 0;
      }
      i++; column++;
    }
  }

  // parsing text, return nothing if not a text (not between double quotes)
  function parseText() {
    if (str[i] === '"') {
      i++; column++;
      let initialColumn = column;
      let starting_i = i;
      let result = "";
      while (i < str.length && str[i] !== '"') {
        if (str[i] === "\\") { // if character is "\", we are expecting an escape-sequence
          const char = str[i + 1];
          if (
            char === '"' ||
            char === "\\" ||
            char === "/" ||
            char === "b" ||
            char === "f" ||
            char === "n" ||
            char === "r" ||
            char === "t"
          ) {
            result += char;
            i++; column++;
          } else if (char === "u") {
            if (
              isHexadecimal(str[i + 2]) &&
              isHexadecimal(str[i + 3]) &&
              isHexadecimal(str[i + 4]) &&
              isHexadecimal(str[i + 5])
            ) {
              result += String.fromCharCode(
                parseInt(str.slice(i + 2, i + 6), 16)
              );
              i += 5;
            } else {
              i += 2;
              expectEscapeUnicode(result);
            }
          } else {
            expectEscapeCharacter(result);
          }
        } else {
          result += str[i];
        }
        i++; column++;
      }
      expectNotEndOfInput('"');
      i++; column++;
      return new TextNode(result, [line, line], [initialColumn, column-1], [starting_i, i-1]); // minus one because of the closing double quote
    }
  }

  // parsing a key and returning it
  function parseKey() {
    let result = "";
    let initialColumn = column;
    let starting_i = i;
    while (i < str.length && str[i] !== '=' && /^[a-zA-Zа-яА-ЯіІїЇʼ'єЄґҐ_0-9]+$/.test(str[i])) {
      result += str[i];
      i++; column++;
    }
    skipWhitespace();
    expectCharacter("=");
    if (/^[1-9ʼ']+$/.test(str[starting_i])) {keyStartsWithWrongChar(result)}
    if (result !== "") { return new TextNode(result, [line, line], [initialColumn, column], [starting_i, i]); }
  }

  // checks if given charcter can be in hexadecimal number
  function isHexadecimal(char) {
    return (
      (char >= "0" && char <= "9") ||
      (char.toLowerCase() >= "a" && char.toLowerCase() <= "f")
    );
  }

  // parsing and returning a number or returning nothing if not a number
  function parseNumber() {
    let start = i;
    let initialColumn = column;
    let starting_i = i;
    if (str[i] === "-") {
      i++; column++;
      expectDigit(str.slice(start, i));
    }
    if (str[i] === "0") {
      i++; column++;
    } else if (str[i] >= "1" && str[i] <= "9") {
      i++; column++;
      while (str[i] >= "0" && str[i] <= "9") {
        i++; column++;
      }
    }

    if (str[i] === ".") {
      i++; column++;
      expectDigit(str.slice(start, i));
      while (str[i] >= "0" && str[i] <= "9") {
        i++; column++;
      }
    }
    if (i > start) {
      return new NumberNode(Number(str.slice(start, i)), [line, line], [initialColumn, column], [starting_i, i]);
    }
  }

  // ingore comma, but expect it
  function eatComma() {
    expectCharacter(",");
    i++; column++;
  }

  // ignore equality sign =, but expect it
  function eatEqualitySign() {
    expectCharacter("=");
    i++; column++;
  }

  // error handling
  function expectNotEndOfInput(expected) {
    if (i === str.length) {
      printCodeSnippet(`Тут очікується \`${expected}\``);
      throw new Error("Неочікуваний кінець вводу");
    }
  }

  function expectEndOfInput() {
    if (i < str.length) {
      printCodeSnippet("Тут очікувався кінець");
      throw new Error("Очікується кінець вводу");
    }
  }

  function expectDictionaryKey() {
    printCodeSnippet(`Тут очікується ключ словнику
  
  Наприклад
  ( ім'я = "Давид" )
    ^^^^^`);
    throw new Error("Очікується ключ");
  }

  function expectObjectKey() {
    printCodeSnippet(`Тут очікується ключ об'єкту
  
  Наприклад
  ( ім'я = "Давид" )
    ^^^^^`);
    throw new Error("Очікується ключ");
  }

  function expectCharacter(expected) {
    if (str[i] !== expected) {
      printCodeSnippet(`Тут очікується \`${expected}\``);
      throw new Error("Неочікуваний токен");
    }
  }

  function expectDigit(numSoFar) {
    if (!(str[i] >= "0" && str[i] <= "9")) {
      printCodeSnippet(`Тут очікується число
  
  Наприклад:
  ${numSoFar}5
  ${" ".repeat(numSoFar.length)}^`);
      throw new Error("Очікується число");
    }
  }

  function expectEscapeCharacter(strSoFar) {
    printCodeSnippet(`Очікується escape-послідовність
  
  Наприклад:
  "${strSoFar}\\n"
  ${" ".repeat(strSoFar.length + 1)}^^
  Можливі escape-послідовності: \\", \\\\, \\/, \\b, \\f, \\n, \\r, \\t, \\u`);
    throw new Error("Очікується символ escape-послідовності");
  }

  function expectEscapeUnicode(strSoFar) {
    printCodeSnippet(`Очікується escape-юнінкод
  
  Наприклад:
  "${strSoFar}\\u0123"
  ${" ".repeat(strSoFar.length + 1)}^^^^^^`);
    throw new Error("Очікується escape-юнікод");
  }

  function keyStartsWithWrongChar(key) { 
    printCodeSnippet(`Ключ об'єкту не може починатися з цифри або деяких інших символів таких як апостроф
  
  Наприклад:
  а${key}
  ${" ".repeat(key.length + 1)}^^^^^^`);
    throw new Error("Ключ починається з забороненого символу");
  }

  // printing error message with a part of code
  function printCodeSnippet(message) {
    const from = Math.max(0, i - 10);
    const trimmed = from > 0;
    const padding = (trimmed ? 4 : 0) + (i - from);
    const snippet = [
      (trimmed ? "... " : "") + str.slice(from, i + 1),
      " ".repeat(padding) + "^",
      " ".repeat(padding) + message
    ].join("\n");
    console.log(snippet);
  }
}
