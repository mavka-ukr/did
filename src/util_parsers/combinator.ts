import {IResult, ParseError, Parser} from "./types";
import {Err, Ok} from "../result";

/**
 * A combinator, that does not consume any input and returns the result of the provided parser.
 * @param parser
 */
export function peek<T>(parser: Parser<T>): Parser<T> {
    return (input: string) => {
        return parser(input).map(([_rest, result]) => [input, result]);
    };
}

/**
 * A combinator that maps the result of a parser combinator
 * using a provided function.
 * */
export function map<T, U>(parser: Parser<T>, f: (value: T) => U): Parser<U> {
    return (input: string) => {
        return parser(input).map(([rest, result]) => [rest, f(result)]);
    };
}

/**
 * A combinator that maps the result of a parser combinator
 * to a provided value.
 */
export function value<T, U>(parser: Parser<T>, value: U): Parser<U> {
    return (input: string) => {
        return parser(input).map(([rest, _]) => [rest, value]);
    };
}

/**
 * A combinator that chains together two util_parsers
 */
export function pair<T, U>(first: Parser<T>, second: Parser<U>): Parser<[T, U]> {
    return (input: string) => {
        return first(input).flatMap(([rest1, result1]) => {
            return second(rest1).map(([rest2, result2]) => [rest2, [result1, result2]]);
        });
    };
}

/**
 * A combinator that chains together an arbitrary number of util_parsers
 * of different output types
 */
export function tuple<T extends any[]>(...parsers: { [K in keyof T]: Parser<T[K]> }): Parser<T> {
    return (input: string) => {
        let result: IResult<any> = new Ok([input, []]);
        for (const parser of parsers) {
            result = result.flatMap(([rest, results]) => {
                return parser(rest).map(([rest, result]) => [rest, [...results, result]]);
            });
        }

        return result as IResult<T>;
    };
}

/**
 * A combinator that tries to apply a parser from the provided list
 * of util_parsers, returning the first successful result.
 */
export function alt<T>(...parsers: Parser<T>[]): Parser<T> {
    return (input: string) => {
        for (const parser of parsers) {
            const result = parser(input);
            if (result.isOk()) {
                return result;
            }
        }

        return new Err(new ParseError("one of the provided parsers", input, "alt"));
    };
}

/**
 * A combinator that sequentially applies the two provided
 * util_parsers, returning the result of the first parser.
 */
export function terminated<T, U>(first: Parser<T>, second: Parser<U>): Parser<T> {
    return map(pair(first, second), ([result, _]) => result);
}

/**
 * A combinator that sequentially applies the two provided
 * util_parsers, returning the result of the second parser.
 */
export function preceded<T, U>(first: Parser<T>, second: Parser<U>): Parser<U> {
    return map(pair(first, second), ([_, result]) => result);
}

/**
 * A combinator that sequentially applies the three provided
 * util_parsers, returning the result of the second parser.
 */
export function delimited<T, U, V>(first: Parser<T>, second: Parser<U>, third: Parser<V>): Parser<U> {
    return preceded(first, terminated(second, third));
}

/**
 * A combinator that applies the provided parser zero or more times,
 * returning the list of results.
 */
export function many0<T>(parser: Parser<T>): Parser<T[]> {
    return (input: string) => {
        let rest = input;
        const results: T[] = [];

        while (true) {
            const prevRestLen = rest.length; // Keep track of the previous `rest.length`
            const next = parser(rest);
            if (next.isOk()) {
                [rest, results[results.length]] = next.unwrap();
            } else {
                break;
            }

            // Infinite loop check: if the parser doesn't consume any input, break the loop
            if (rest.length === prevRestLen) {
                return new Err(new ParseError("parser that consumes input", input, "many0"));
            }
        }

        return new Ok([rest, results]);
    };
}

/**
 * A combinator that applies the provided parser one or more times,
 * returning the list of results.
 * @param parser
 * @typedef T The type of the result of the input parser
 * @returns {Parser<T[]>} A parser that returns the list of results of the input parser,
 * applied one or more times. If the input parser fails on the first iteration,
 * the returned parser fails, or the parser does not consume input.
 */
export function many1<T>(parser: Parser<T>): Parser<T[]> {
    return (input: string) => {
        let rest = input;
        const results: T[] = [];

        const first = parser(rest);
        if (first.isErr()) {
            return new Err(new ParseError("at least one successful parse", input, "many1"));
        }

        [rest, results[0]] = first.unwrap();

        while (true) {
            const prevRestLen = rest.length; // Keep track of the previous rest
            const next = parser(rest);
            if (next.isOk()) {
                [rest, results[results.length]] = next.unwrap();
            } else {
                break;
            }

            // Infinite loop check: if the parser doesn't consume any input, break the loop
            if (rest.length === prevRestLen) {
                return new Err(new ParseError("parser that consumes input", input, "many1"));
            }
        }

        return new Ok([rest, results]);
    };
}

/**
 * A combinator that alternates between two util_parsers to produce a list of elements.
 * @param separator Parses the separator between list elements.
 * @param parser Parses the list elements.
 * @returns A parser that returns the list of results of the input parser,
 * applied zero or more times. If the `separator` parser does not consume input,
 * the returned parser fails.
 */
export function separatedList0<T, U>(separator: Parser<U>, parser: Parser<T>): Parser<T[]> {
    return (input: string) => {
        let rest = input;
        const results: T[] = [];

        while (true) {
            const parserResult = parser(rest);
            if (parserResult.isErr()) {
                break;
            }

            [rest, results[results.length]] = parserResult.unwrap();

            const separatorResult = separator(rest);
            if (separatorResult.isErr()) {
                break;
            }

            const prevRest = rest;
            rest = separatorResult.unwrap()[0];

            // Infinite loop check: the separator parser must always consume
            if (rest.length === prevRest.length) {
                return new Err(new ParseError("parser that consumes input", input, "separated list"));
            }
        }

        return new Ok([rest, results]);
    };
}

export function separatedList1<T, U>(separator: Parser<U>, parser: Parser<T>): Parser<T[]> {
    return (input: string) => {
        let rest = input;
        const results: T[] = [];

        const firstResult = parser(rest);
        if (firstResult.isErr()) {
            return new Err(new ParseError("at least one successful parse", input, "separated list"));
        }

        [rest, results[0]] = firstResult.unwrap();

        while (true) {
            const separatorResult = separator(rest);
            if (separatorResult.isErr()) {
                break;
            }

            const prevRest = rest;
            rest = separatorResult.unwrap()[0];

            // Infinite loop check: the separator parser must always consume
            if (rest.length === prevRest.length) {
                return new Err(new ParseError("parser that consumes input", input, "separated list"));
            }

            const parserResult = parser(rest);
            if (parserResult.isErr()) {
                break;
            }

            [rest, results[results.length]] = parserResult.unwrap();
        }

        return new Ok([rest, results]);
    };
}

/**
 * A combinator that applies the provided parser and returns the consumed string on success.
 * @param parser The parser to apply.
 * @returns {Parser<string>} A parser that returns the consumed string on success.
 */
export function recognize<T>(parser: Parser<T>): Parser<string> {
    return (input: string) => {
        const result = parser(input);
        if (result.isErr()) {
            return new Err(result.unwrapErr());
        }

        const [rest, _] = result.unwrap();
        return new Ok([rest, input.slice(0, input.length - rest.length)]);
    };
}

/**
 * A combinator that applies the provided parser and returns its result on success,
 * or `undefined` on failure.
 * @param parser The parser to apply.
 * @returns {Parser<T | null>} A parser that returns the result of the input parser on success,
 * or `undefined` on failure.
 */
export function opt<T>(parser: Parser<T>): Parser<T | null> {
    return (input: string) => {
        const result = parser(input);
        if (result.isErr()) {
            return new Ok([input, null]);
        }

        return result;
    };
}
