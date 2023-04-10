import {IResult, ParseError, Parser} from "./types";
import {Err, Ok} from "../result";

const tagParsers = new Map<string, Parser<string>>();

/**
 * A parser that matches a string value.
 * @param value the string value to match against.
 * @returns {Parser<string>} the resulting parser, that looks
 * if the input string starts with the provided value, returning
 * this value and a rest of input on success.
 */
export function tag(value: string): Parser<string> {
    let parser = tagParsers.get(value);
    if (parser) {
        return parser;
    }
    parser = (input: string) => {
        if (input.startsWith(value)) {
            return new Ok([input.slice(value.length), value]);
        }
        return new Err(new ParseError(value, input, "tag"));
    };
    tagParsers.set(value, parser);
    return parser;
}

/**
 * A parser that matches zero or more whitespaces.
 * @param input the parser input string
 * @returns {IResult<string>} the result of parsing, containing a
 * maybe empty string of whitespace symbols, and the rest of input
 */
export function whitespace0(input: string): IResult<string> {
    // `^` asserts position at start of the string
    //  `\s` matches any whitespace character (equivalent to [\r\n\t\f\v \u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff])
    //  `*` matches the previous token between zero and unlimited times, as many times as possible, giving back as needed (greedy)
    const match = input.match(/^\s*/)!;

    return new Ok([input.slice(match[0].length), match[0]]);
}

/**
 * A parser that matches one or more whitespaces.
 * @param input the parser input string
 * @returns {IResult<string>} the result of parsing, containing a
 * string of whitespace symbols at least 1 symbol long, and the rest of input
 */
export function whitespace1(input: string): IResult<string> {
    // `^` asserts position at start of the string
    //  `\s` matches any whitespace character (equivalent to [\r\n\t\f\v \u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff])
    //  `+` matches the previous token between one and unlimited times, as many times as possible, giving back as needed (greedy)
    const match = input.match(/^\s+/);
    if (match) {
        return new Ok([input.slice(match[0].length), match[0]]);
    }
    return new Err(new ParseError("one or more whitespaces", input, "whitespace1"));
}

/**
 * A parser that matches line ending
 * @param input the parser input string
 * @returns {IResult<string>} the result of parsing, containing a
 * LF/CRLF and the rest of the input
 */
export function lineEnding(input: string): IResult<string> {
    const match = input.match(/^(\n|(\r\n))/);
    if (match) {
        return new Ok([input.slice(match[0].length), match[0]]);
    }
    return new Err(new ParseError("line ending", input, "line ending"))
}

/**
 * A parser that matches the end of input stream (EOF)
 * @param input the parser input string
 * @returns {IResult<null>} the result of parsing, indicating about an
 * EOF or error otherwise.
 */
export function eof(input: string): IResult<null> {
    if (input.length === 0) {
        return new Ok([input, null])
    }
    return new Err(new ParseError("EOF", input, "eof"))
}

/**
 * A parser that matches a single character from the alphabet (Latin or Cyrillic Ukrainian)
 * @param input the parser input string
 * @returns {IResult<string>} the result of parsing, containing a single
 * character from the alphabet and the rest of the input
 */
export function alpha(input: string): IResult<string> {
    const match = input.match(/^[a-zA-Zа-яА-ЯіІїЇєЄґҐ]/);
    if (match) {
        return new Ok([input.slice(1), match[0]]);
    }
    return new Err(new ParseError("alpha", input, "alpha"))
}

/**
 * A parser that matches a single numeric character
 * @param input the parser input string
 * @returns {IResult<string>} the result of parsing, containing a single
 * numeric character and the rest of the input
 */
export function numeric(input: string): IResult<string> {
    const match = input.match(/^\d/);
    if (match) {
        return new Ok([input.slice(1), match[0]]);
    }
    return new Err(new ParseError("numeric", input, "numeric"))
}

/**
 * A parser that matches a single alphanumeric character (Latin or Cyrillic Ukrainian)
 * @param input the parser input string
 * @returns {IResult<string>} the result of parsing, containing a single
 * alphanumeric character and the rest of the input
 */
export function alphaNumeric(input: string): IResult<string> {
    const match = input.match(/^[a-zA-Zа-яА-ЯіІїЇєЄґҐ0-9]/);
    if (match) {
        return new Ok([input.slice(1), match[0]]);
    }
    return new Err(new ParseError("alphaNumeric", input, "alphaNumeric"))
}

/**
 * A parser that matches zero or more character from the alphabet (Latin or Cyrillic Ukrainian)
 * @param input the parser input string
 * @returns {IResult<string>} the result of parsing, containing a string
 * of characters from the alphabet and the rest of the input
 */
export function alpha0(input: string): IResult<string> {
    const match = input.match(/^[a-zA-Zа-яА-ЯіІїЇєЄґҐ]*/)!;
    return new Ok([input.slice(match[0].length), match[0]]);
}

/**
 * A parser that matches zero or more numeric characters
 * @param input the parser input string
 * @returns {IResult<string>} the result of parsing, containing a string
 * of numeric characters and the rest of the input
 */
export function numeric0(input: string): IResult<string> {
    const match = input.match(/^\d*/)!;
    return new Ok([input.slice(match[0].length), match[0]]);
}

/**
 * A parser that matches zero or more alphanumeric characters (Latin or Cyrillic Ukrainian)
 * @param input the parser input string
 * @returns {IResult<string>} the result of parsing, containing a string
 * of alphanumeric characters and the rest of the input
 */
export function alphaNumeric0(input: string): IResult<string> {
    const match = input.match(/^[a-zA-Zа-яА-ЯіІїЇєЄґҐ0-9]*/)!;
    return new Ok([input.slice(match[0].length), match[0]]);
}

/**
 * A parser that matches one or more character from the alphabet (Latin or Cyrillic Ukrainian)
 * @param input the parser input string
 * @returns {IResult<string>} the result of parsing, containing a string
 * of characters from the alphabet and the rest of the input
 */
export function alpha1(input: string): IResult<string> {
    const match = input.match(/^[a-zA-Zа-яА-ЯіІїЇєЄґҐ]+/);
    if (match) {
        return new Ok([input.slice(match[0].length), match[0]]);
    }
    return new Err(new ParseError("alpha", input, "alpha1"))
}

/**
 * A parser that matches one or more numeric characters
 * @param input the parser input string
 * @returns {IResult<string>} the result of parsing, containing a string
 * of numeric characters and the rest of the input
 */
export function numeric1(input: string): IResult<string> {
    const match = input.match(/^\d+/);
    if (match) {
        return new Ok([input.slice(match[0].length), match[0]]);
    }
    return new Err(new ParseError("numeric", input, "numeric1"))
}

/**
 * A parser that matches one or more alphanumeric characters (Latin or Cyrillic Ukrainian)
 * @param input the parser input string
 * @returns {IResult<string>} the result of parsing, containing a string
 * of alphanumeric characters and the rest of the input
 */
export function alphaNumeric1(input: string): IResult<string> {
    const match = input.match(/^[a-zA-Zа-яА-ЯіІїЇєЄґҐ0-9]+/);
    if (match) {
        return new Ok([input.slice(match[0].length), match[0]]);
    }
    return new Err(new ParseError("alphaNumeric", input, "alphaNumeric1"))
}

/**
 * A parser that matches a single character from the given string
 * @param chars the string of characters to match
 * @returns {Parser<string>} the parser that matches a single character
 * from the given string of characters
 */
export function oneOf(chars: string): Parser<string> {
    const regexp = new RegExp(`^([${chars}])`);
    return (input: string) => {
        const match = input.match(regexp);
        if (match) {
            return new Ok([input.slice(match[0].length), match[0]]);
        }
        return new Err(new ParseError(`one of chars in "${chars}"`, input, "one of"))
    };
}

/**
 * A parser that matches a single character that is not from the given string
 * @param chars the string of characters to match against
 * @returns {Parser<string>} the parser that matches a single character not
 * from the given string of characters
 */
export function noneOf(chars: string): Parser<string> {
    const regexp = new RegExp(`^([^${chars}])`);
    return (input: string) => {
        const match = input.match(regexp);
        if (match) {
            return new Ok([input.slice(match[0].length), match[0]]);
        }
        return new Err(new ParseError(`none of chars in "${chars}"`, input, "none of"))
    };
}
