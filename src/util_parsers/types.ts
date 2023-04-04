import {Result} from "../result";

/**
 * Result of a parser util_parsers, representing, as an `Ok` variant,
 * a result of the util_parsers of type `T` and the remaining input of type `string`,
 * or as an `Err`, a parse error.
 * */
export type IResult<T> = Result<[string, T], ParseError>;

/**
 * A parser util_parsers is a function that takes a string as input and returns
 * a result of type `IResult<T>`.
 */
export type Parser<T> = (input: string) => IResult<T>;

export type ErrorKind =
    "tag" | "eof" | "alpha" | "numeric" | "alphaNumeric" | "alpha1" | "numeric1" | "alphaNumeric1" | "one of" | "none of"
    | "whitespace1" | "alt" | "line ending"
    | "many0" | "many1" | "separated list" | "escaped"
    | CustomError;

export class CustomError {
    constructor(public readonly msg: string) {
    }

    toString(): string {
        return this.msg
    }
}

export class ParseError {
    constructor(
        public expected: string,
        public input: string,
        public kind?: ErrorKind,
    ) {
    }

    toString(): string {
        const kind = this.kind ? `(${this.kind})` : "";
        return `ParseError${kind}: Expected '${this.expected}' but got '${this.input}'`;
    }
}
