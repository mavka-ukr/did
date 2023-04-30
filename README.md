# Дід

Парсер формату Дід.

## Встановлення

```bash
npm i mavka-did
```

## Використання

```js
import { parse } from 'mavka-did';

const code = `
Людина(
  імʼя="Давид",
  прізвище="Когут",
  вік=0,
  параметри=(
    висота=175,
    вага=69
  ),
  зацікавлення=["творення", "життя"]
)
`;

const ast = parse(code);

console.log(ast);
```

## Тести

Запуск тестів, використовується [Mocha](https://mochajs.org)

```bash
npm test
```
