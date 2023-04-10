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
    //  `\s` matches any whitespace character (equivalent to [\r\n\t\f\v
    // \u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]) `*` matches the previous token between zero and
    // unlimited times, as many times as possible, giving back as needed (greedy)
    const match = input.match(/^\s*/)!;

    return new Ok([input.slice(match[0].length), match[0]]);
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
    return new Err(new ParseError("alpha", input, "alpha"));
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
    return new Err(new ParseError("alphaNumeric", input, "alphaNumeric"));
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
    return new Err(new ParseError("numeric", input, "numeric1"));
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
        return new Err(new ParseError(`one of chars in "${chars}"`, input, "one of"));
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
        return new Err(new ParseError(`none of chars in "${chars}"`, input, "none of"));
    };
}
