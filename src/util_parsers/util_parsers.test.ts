import {Err, Ok} from "../result";
import {
    alpha,
    alphaNumeric, noneOf,
    numeric1, oneOf,
    tag,
    whitespace0,
} from "./basic";
import {
    alt,
    many0,
    many1,
    map, opt,
    pair,
    peek, preceded, recognize,
    separatedList0,
    separatedList1,
    terminated,
    tuple,
    value,
} from "./combinator";
import {describe, expect, test} from "@jest/globals";
import {ParseError} from "./types";

describe("Basic parsers", () => {
    test("`tag` parses a string, that starts with the given value", () => {
        const parser = tag("foo");
        const result = parser("foobar");
        expect(result).toStrictEqual(new Ok(["bar", "foo"]));
    });

    test("`tag` fails to parse a string, that does not start with the given value", () => {
        const parser = tag("foo");
        const result = parser("bar");
        expect(result).toStrictEqual(new Err(new ParseError("foo", "bar", "tag")));
    });

    test("`whitespace0` parses a string, that starts with spaces", () => {
        const result = whitespace0("  foo");
        expect(result).toStrictEqual(new Ok(["foo", "  "]));
    });

    test("`whitespace0` parses a string, that starts with tabs", () => {
        const result = whitespace0("\tfoo");
        expect(result).toStrictEqual(new Ok(["foo", "\t"]));
    });

    test("`whitespace0` parses a string, that starts with spaces and tabs", () => {
        const result = whitespace0("\t  foo");
        expect(result).toStrictEqual(new Ok(["foo", "\t  "]));
    });

    test("`whitespace0` parses a string, that starts with no whitespace", () => {
        const result = whitespace0("foo");
        expect(result).toStrictEqual(new Ok(["foo", ""]));
    });

    test("`whitespace0` parses a string, that starts with a newline", () => {
        const result = whitespace0("\nfoo");
        expect(result).toStrictEqual(new Ok(["foo", "\n"]));
    });

    test("`alpha` parses a string, that starts with a letter", () => {
        const result = alpha("foo");
        expect(result).toStrictEqual(new Ok(["oo", "f"]));

        const result2 = alpha("бар");
        expect(result2).toStrictEqual(new Ok(["ар", "б"]));
    });

    test("`alpha` fails to parse a string, that starts with a digit", () => {
        const result = alpha("1foo");
        expect(result).toStrictEqual(new Err(new ParseError("alpha", "1foo", "alpha")));
    });

    test("`alpha` fails to parse a string, that starts with a symbol", () => {
        const result = alpha("!foo");
        expect(result).toStrictEqual(new Err(new ParseError("alpha", "!foo", "alpha")));
    });

    test("`alpha` fails to parse a string, that starts with a whitespace", () => {
        const result = alpha(" foo");
        expect(result).toStrictEqual(new Err(new ParseError("alpha", " foo", "alpha")));
    });

    test("`numeric1` parses a string, that starts with a digit", () => {
        const result = numeric1("123foo");
        expect(result).toStrictEqual(new Ok(["foo", "123"]));
    });

    test("`numeric1` fails to parse a string, that starts with a letter", () => {
        const result = numeric1("foo");
        expect(result).toStrictEqual(new Err(new ParseError("numeric", "foo", "numeric1")));
    });

    test("`alphaNumeric` parses a string, that starts with a letter", () => {
        const result = alphaNumeric("foo");
        expect(result).toStrictEqual(new Ok(["oo", "f"]));
    });

    test("`alphaNumeric` parses a string, that starts with a digit", () => {
        const result = alphaNumeric("1foo");
        expect(result).toStrictEqual(new Ok(["foo", "1"]));
    });

    test("`alphaNumeric` fails to parse a string, that starts with a symbol", () => {
        const result = alphaNumeric("!foo");
        expect(result).toStrictEqual(new Err(new ParseError("alphaNumeric", "!foo", "alphaNumeric")));
    });

    test("`oneOf` parses a string, that starts with one of the given characters", () => {
        const parser = oneOf("abc");
        const result = parser("abc");
        expect(result).toStrictEqual(new Ok(["bc", "a"]));
    });

    test("`oneOf` fails to parse a string, that starts with none of the given characters", () => {
        const parser = oneOf("abc");
        const result = parser("def");
        expect(result).toStrictEqual(new Err(new ParseError("one of chars in \"abc\"", "def", "one of")));
    });

    test("`noneOf` parses a string, that starts with none of the given characters", () => {
        const parser = noneOf("abc");
        const result = parser("def");
        expect(result).toStrictEqual(new Ok(["ef", "d"]));
    });

    test("`noneOf` fails to parse a string, that starts with one of the given characters", () => {
        const parser = noneOf("abc");
        const result = parser("abc");
        expect(result).toStrictEqual(new Err(new ParseError("none of chars in \"abc\"", "abc", "none of")));
    });
});

describe("Combinators", () => {
    test("`map` maps the result of a parser", () => {
        const parser = map(tag("foo"), (value) => value.toUpperCase());
        const result = parser("foobar");
        expect(result).toStrictEqual(new Ok(["bar", "FOO"]));
    });

    test("`value` returns a parser that always returns the given value", () => {
        const parser = value(tag("foo"), "baz");
        const result = parser("foobar");
        expect(result).toStrictEqual(new Ok(["bar", "baz"]));
    });

    test("`pair` returns a parser that returns the result of two util_parsers as a pair", () => {
        const parser = pair(tag("foo"), tag("bar"));
        const result = parser("foobarbaz");
        expect(result).toStrictEqual(new Ok(["baz", ["foo", "bar"]]));
    });

    test("`tuple` returns a parser that returns the result of a number of util_parsers as a tuple", () => {
        const parser = tuple(tag("foo"), value(tag("bar"), 10), map(tag("baz"), s => s.toUpperCase()));
        const result = parser("foobarbaz");
        expect(result).toStrictEqual(new Ok(["", ["foo", 10, "BAZ"]]));
    });

    test("`alt` returns a parser that returns the result of the first parser, if it succeeds", () => {
        const parser = alt(tag("foo"), tag("bar"));
        const result = parser("foobarbaz");
        expect(result).toStrictEqual(new Ok(["barbaz", "foo"]));
    });

    test("`alt` returns a parser that returns the result of the second parser, if the first one fails", () => {
        const parser = alt(tag("foo"), tag("bar"));
        const result = parser("barbaz");
        expect(result).toStrictEqual(new Ok(["baz", "bar"]));
    });

    test("`alt` returns a parser that fails, if both util_parsers fail", () => {
        const parser = alt(tag("foo"), tag("bar"));
        const result = parser("baz");
        expect(result).toStrictEqual(new Err(new ParseError("one of the provided parsers", "baz", "alt")));
    });

    test("`terminated` returns a parser that returns the result of the first parser, if it succeeds", () => {
        const parser = terminated(tag("foo"), tag("bar"));
        const result = parser("foobarbaz");
        expect(result).toStrictEqual(new Ok(["baz", "foo"]));
    });

    test("`terminated` returns a parser that fails, if the first parser fails", () => {
        const parser = terminated(tag("foo"), tag("bar"));
        const result = parser("barbaz");
        expect(result).toStrictEqual(new Err(new ParseError("foo", "barbaz", "tag")));
    });

    test("`terminated` returns a parser that fails, if the second parser fails", () => {
        const parser = terminated(tag("foo"), tag("bar"));
        const result = parser("foobaz");
        expect(result).toStrictEqual(new Err(new ParseError("bar", "baz", "tag")));
    });

    test("`preceded` returns a parser that returns the result of the second parser, if it succeeds", () => {
        const parser = preceded(tag("foo"), tag("bar"));
        const result = parser("foobarbaz");
        expect(result).toStrictEqual(new Ok(["baz", "bar"]));
    });

    test("`preceded` returns a parser that fails, if the first parser fails", () => {
        const parser = preceded(tag("foo"), tag("bar"));
        const result = parser("barbaz");
        expect(result).toStrictEqual(new Err(new ParseError("foo", "barbaz", "tag")));
    });

    test("`preceded` returns a parser that fails, if the second parser fails", () => {
        const parser = preceded(tag("foo"), tag("bar"));
        const result = parser("foobaz");
        expect(result).toStrictEqual(new Err(new ParseError("bar", "baz", "tag")));
    });

    test("`many0` returns a parser that returns an array of the results of the parser, if the parser succeeds", () => {
        const parser = many0(tag("foo"));
        const result = parser("foofoofoo");
        expect(result).toStrictEqual(new Ok(["", ["foo", "foo", "foo"]]));
    });

    test("`many0` returns a parser that returns an empty array, if the parser fails", () => {
        const parser = many0(tag("foo"));
        const result = parser("bar");
        expect(result).toStrictEqual(new Ok(["bar", []]));
    });

    test("`many0` fails if the parser is not consuming", () => {
        const parser = many0(peek(tag("")));
        const result = parser("foo");
        expect(result).toStrictEqual(new Err(new ParseError("parser that consumes input", "foo", "many0")));
    });

    test("`many1` returns a parser that returns an array of the results of the parser, if the parser succeeds", () => {
        const parser = many1(tag("foo"));
        const result = parser("foofoofoo");
        expect(result).toStrictEqual(new Ok(["", ["foo", "foo", "foo"]]));
    });

    test("`many1` returns a parser that fails, if the first parser fails", () => {
        const parser = many1(tag("foo"));
        const result = parser("bar");
        expect(result).toStrictEqual(
            new Err(new ParseError("at least one successful parse", "bar", "many1")),
        );
    });

    test("`many1` fails if the parser is not consuming", () => {
        const parser = many1(peek(tag("")));
        const result = parser("foo");
        expect(result).toStrictEqual(new Err(new ParseError("parser that consumes input", "foo", "many1")));
    });

    test(
        "`peek` returns a parser that returns the result of the provided parser and the original input, if it succeeds",
        () => {
            const parser = peek(tag("foo"));
            const result = parser("foobar");
            expect(result).toStrictEqual(new Ok(["foobar", "foo"]));
        },
    );

    test(
        "`separatedList0` returns a parser that returns an array of the results of the second parser, if the parser chain succeeds",
        () => {
            const parser = separatedList0(tag(","), tag("foo"));
            const result = parser("foo,foo,foo");
            expect(result).toStrictEqual(new Ok(["", ["foo", "foo", "foo"]]));
        },
    );

    test("`separatedList0` returns a parser that returns an empty array, if the first parser fails", () => {
        const parser = separatedList0(tag(","), tag("foo"));
        const result = parser("bar");
        expect(result).toStrictEqual(new Ok(["bar", []]));
    });

    test("`separatedList0` fails if the separator parser is not consuming", () => {
        const parser = separatedList0(peek(tag(",")), tag("foo"));
        const result = parser("foo,foo");
        expect(result).toStrictEqual(
            new Err(new ParseError("parser that consumes input", "foo,foo", "separated list")),
        );
    });

    test(
        "`separatedList1` returns a parser that returns an array of the results of the second parser, if the parser chain succeeds",
        () => {
            const parser = separatedList1(tag(","), tag("foo"));
            const result = parser("foo,foo,foo");
            expect(result).toStrictEqual(new Ok(["", ["foo", "foo", "foo"]]));
        },
    );

    test("`separatedList1` fails if the first parse fails", () => {
        const parser = separatedList1(tag(","), tag("foo"));
        const result = parser("bar");
        expect(result).toStrictEqual(
            new Err(new ParseError("at least one successful parse", "bar", "separated list")),
        );
    });

    test("`separatedList1` fails if the separator parser is not consuming", () => {
        const parser = separatedList1(peek(tag(",")), tag("foo"));
        const result = parser("foo,foo");
        expect(result).toStrictEqual(
            new Err(new ParseError("parser that consumes input", "foo,foo", "separated list")),
        );
    });

    test("`recognize` returns a parser that returns the input that was consumed by the provided parser", () => {
        const parser = recognize(separatedList0(tag(","), tag("foo")));
        const result = parser("foo,foo");
        expect(result).toStrictEqual(new Ok(["", "foo,foo"]));
    });

    test("`recognize` fails if the provided parser fails", () => {
        const parser = recognize(tag("foo"));
        const result = parser("bar");
        expect(result).toStrictEqual(new Err(new ParseError("foo", "bar", "tag")));
    });

    test("`opt` returns a parser that returns the result of the provided parser, if it succeeds", () => {
        const parser = opt(tag("foo"));
        const result = parser("foobar");
        expect(result).toStrictEqual(new Ok(["bar", "foo"]));
    });

    test("`opt` returns a parser that returns `null`, if the provided parser fails", () => {
        const parser = opt(tag("foo"));
        const result = parser("bar");
        expect(result).toStrictEqual(new Ok(["bar", null]));
    });
});