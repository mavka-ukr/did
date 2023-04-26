/**
 * Represents a result of an operation that may fail.
 * Can be either `Ok` or `Err`.
 */
export type Result<T, E> = Ok<T, E> | Err<T, E>;

/**
 * Represents a successful result of an operation.
 */
export class Ok<T, E> {
    constructor(public value: T) {
    }

    isOk(): this is Ok<T, E> {
        return true;
    }

    isErr(): this is Err<T, E> {
        return false;
    }

    map<U>(f: (value: T) => U): Result<U, E> {
        return new Ok(f(this.value));
    }

    mapErr<U>(_f: (error: E) => U): Result<T, U> {
        return new Ok(this.value);
    }

    /**
     * Unwraps the value of this result.
     * @throws {Error} If the result is an Err.
     */
    unwrap(): T {
        return this.value;
    }

    /**
     * Unwraps the error of this result.
     * @throws {Error} If the result is an Ok.
     */
    unwrapErr(): E {
        throw new Error(`Called Result::unwrapErr() on Ok variant ${this.value}`);
    }

    /**
     * Unwraps the value of this `Result` or returns the provided default value.
     * @param _defaultValue The default value to return if the `Result` is an `Err`. (not used)
     */
    unwrapOr(_defaultValue: T): T {
        return this.value;
    }

    /**
     * Maps the value of this `Result` using the provided function if the `Result` is an `Ok`.
     * Otherwise, returns the original `Err` value.
     *
     * @param f The function to map the value.
     * @returns The result of the function or the original `Err` value.
     */
    flatMap<U>(f: (value: T) => Result<U, E>): Result<U, E> {
        return f(this.value);
    }

    toString(): string {
        return `Ok(${this.value})`;
    }
}

/**
 * Represents a failed result of an operation.
 */
export class Err<T, E> {
    constructor(public error: E) {
    }

    /**
     * Returns true if the `Result` is an `Ok`. Otherwise, false.
     */
    isOk(): this is Ok<T, E> {
        return false;
    }

    /**
     * Returns true if the `Result` is an `Rrr`. Otherwise, false.
     */
    isErr(): this is Err<T, E> {
        return true;
    }

    /**
     * Maps the value of this result using the provided function.
     * @param _f The function to map the value. (not used)
     */
    map<U>(_f: (value: T) => U): Result<U, E> {
        return new Err(this.error);
    }

    /**
     * Maps the error of this result using the provided function.
     * @param f The function to map the error.
     */
    mapErr<U>(f: (error: E) => U): Result<T, U> {
        return new Err(f(this.error));
    }

    /**
     * Unwraps the value of this `Result`.
     * @throws {Error} If the value is an `Err`.
     */
    unwrap(): T {
        throw new Error(`Called Result::unwrap() on err variant: ${this.error}`);
    }

    /**
     * Unwraps the error of this `Result`.
     * @throws {Error} If the value is an `Ok`.
     */
    unwrapErr(): E {
        return this.error;
    }

    /**
     * Unwraps the value of this `Result` or returns the provided default value.
     * @param defaultValue The default value to return if the `Result` is an `Err`.
     */
    unwrapOr(defaultValue: T): T {
        return defaultValue;
    }

    /**
     * Maps the value of this `Result` using the provided function if the `Result` is an `Ok`.
     * @param _f The function to map the value. (not used)
     */
    flatMap<U>(_f: (value: T) => Result<U, E>): Result<U, E> {
        return new Err(this.error);
    }

    toString(): string {
        return `Err(${this.error})`;
    }
}
