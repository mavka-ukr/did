import {IResult, ParseError, Parser} from "./types";
import {Err, Ok} from "../result";

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
        let result: IResult<any> = new Ok([input, Array(parsers.length)]);
        let index = 0;

        for (const parser of parsers) {
            result = result.flatMap(
                ([rest, results]) =>
                    parser(rest).map(
                        ([rest, result]) => {
                            results[index] = result;
                            index++;
                            return [rest, results];
                        },
                    ),
            );
        }

        return result as IResult<T>;
    };
}

/**
 * A combinator that applies a parser and returns the result if it succeeds,
 * otherwise returns the provided error.
 * @param parser The parser to apply
 * @param err The error to return if the parser fails
 */
export function withError<T>(parser: Parser<T>, err: ParseError): Parser<T> {
    return input => {
        const result = parser(input);
        if (result.isOk()) {
            return result;
        }

        return new Err(err);
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
