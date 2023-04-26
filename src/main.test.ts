import {describe} from "@jest/globals";
import {parse} from "./main";

describe("`parse` function", () => {
    test("should not parse empty code", () => {
        expect(() => parse("")).toThrow();
    });

//     test("should parse simple code", () => {
//         const code = `
// Людина(
//   імʼя="Давид",
//   прізвище="Когут",
//   вік=0,
//   параметри(
//     висота=175,
//     вага=69
//   ),
//   зацікавлення=["творення", "життя"]
// )
// `;
//
//         const ast = parse(code);
//
//         console.log(ast);
//     });
});