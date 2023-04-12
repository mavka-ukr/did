import { parse } from "./src/index.js"

const benchmark = (func : (_: any) => any, params: any, iterations: number) => {
    const t0 = performance.now()
    
    for (let i = 0; i < iterations; i++) {
        let x = func(params)
    }

    const t1 = performance.now()
    
    return `${1000 * (t1 - t0) / iterations} μs`
}

console.log(benchmark(parse, `(а=2, "б"="2", є=[], Ї=(), Ґ=Книжка(), 999=238)`, 100_000));
console.log(benchmark(parse, `Людина(
  імʼя="Давид",
  прізвище="Когут",
  вік=0,
  параметри=(
    висота=175,
    вага=69
  ),
  зацікавлення=["творення", "життя"]
)`, 100_000));
  console.log(benchmark(parse, `[1, -2, 3.14, "привіт", Людина(імʼя="Давид"), ["2211"]]`, 100_000));
  console.log(process.memoryUsage());
