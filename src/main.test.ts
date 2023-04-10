import {describe} from "@jest/globals";
import {parse} from "./main";

describe("`parse` function", () => {
    test("should not parse empty code", () => {
        expect(() => parse("")).toThrow();
    });
});