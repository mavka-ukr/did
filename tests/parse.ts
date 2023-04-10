import { ObjectEntryNode, DictionaryEntryNode, DictionaryNode, ListNode, LogicalNode, ObjectNode, EmptyNode, parse, TextNode, NumberNode } from "../src";

test('швидкий тест', () => {
  const data = parse(`Паспорт(
        прізвище="Когут",
        імʼя="Давид",
        по_батькові="Богданович",
        дата_народження=Дата(
          день=20,
          місяць=1,
          рік=2001
        ),
        застарілий=ні
      )
    `);
  expect(data).not.toBeNull();
});
describe("числа", () => {
  test('цілі числа', () => {
    const data = parse(`20`);
    expect(data).toEqual(new NumberNode(20));
  });
  test('числа із плаваючею точкою', () => {
    const data = parse(`120.2`);
    expect(data).toEqual(new NumberNode(120.2));
  });
  test('негативні числа', () => {
    const data = parse(`-20.2`);
    expect(data).toEqual(new NumberNode(-20.2));
  });
  test('негативні числа із пробелом', () => {
    expect(() => parse(`- 20.2`)).toThrow("");
  });
})

describe("Логічні значення", () => {
  test('так', () => {
    const data = parse(`так`);
    expect(data).toEqual(new LogicalNode(true));
  });
  test('ні', () => {
    const data = parse(`ні`);
    expect(data).toEqual(new LogicalNode(false));
  });
})

test('пусто', () => {
  const data = parse(`пусто`);
  expect(data).toBe(EmptyNode.instance);
});

describe("Текстові рядки", () => {
  test('звичайна строка', () => {
    const data = parse(`"Привіт від Лесі!"`);
    expect(data).toEqual(new TextNode("Привіт від Лесі!"));
  });
  test('екрановані символи', () => {
    const data = parse("\"\\n\\r\"");
    expect(data).toEqual(new TextNode("\n\r"));
  });
})

describe("Обʼектні data", () => {
  test('типовий обʼект', () => {
    const data = parse(`Паспорт(
      прізвище="Когут",
      імʼя="Давид",
      по_батькові="Богданович",
      дата_народження=Дата(
        день=20,
        місяць=1,
        рік=2001
      ),
      борг=пусто,
      застарілий=ні
    )`);
    expect(data).toEqual(new ObjectNode("Паспорт", [
      new ObjectEntryNode("прізвище", new TextNode("Когут")),
      new ObjectEntryNode("імʼя", new TextNode("Давид")),
      new ObjectEntryNode("по_батькові", new TextNode("Богданович")),
      new ObjectEntryNode("дата_народження", new ObjectNode("Дата", [
        new ObjectEntryNode("день", new NumberNode(20)),
        new ObjectEntryNode("місяць", new NumberNode(1)),
        new ObjectEntryNode("рік", new NumberNode(2001)),
      ])),
      new ObjectEntryNode("борг", EmptyNode.instance),
      new ObjectEntryNode("застарілий", new LogicalNode(false)),
    ]));
  });
  test('обʼект із назвою так', () => {
    const data = parse(`так(
      прізвище="Когут",
    )`);
    expect(data).toEqual(new ObjectNode("так", [
      new ObjectEntryNode("прізвище", new TextNode("Когут")),
    ]));
  });
  test('обʼект із назвою ні', () => {
    const data = parse(`ні(
      прізвище="Когут",
    )`);
    expect(data).toEqual(new ObjectNode("ні", [
      new ObjectEntryNode("прізвище", new TextNode("Когут")),
    ]));
  });
  test('обʼект із назвою пусто', () => {
    const data = parse(`пусто(
      прізвище="Когут",
    )`);
    expect(data).toEqual(new ObjectNode("пусто", [
      new ObjectEntryNode("прізвище", new TextNode("Когут")),
    ]));
  });
  test('пропуск коми дає помилку', () => {
    expect(() => parse(`Людина(
      прізвище="Когут"
      імʼя="Давид"
    )`)).toThrow("Очікувалася кома. Замість цього на рядку 3 стовпець 7 знаходиься 'імʼя'");
  });
})

describe("Список", () => {
  test('типовий обʼект', () => {
    const data = parse(`[1, -2, 3.14, "привіт", Людина(імʼя="Давид"), ["2211"]]`);
    expect(data).toEqual(new ListNode([
      new NumberNode(1),
      new NumberNode(-2),
      new NumberNode(3.14),
      new TextNode("привіт"),
      new ObjectNode("Людина", [
        new ObjectEntryNode("імʼя", new TextNode("Давид")),
      ]),
      new ListNode([new TextNode("2211")]),
    ]));
  });
  test('пропуск коми дає помилку', () => {
    expect(() => parse(`[1, -2, 3.14, "привіт" Людина(імʼя="Давид"), ["2211"]]`))
      .toThrow("Очікувалася кома. Замість цього на рядку 1 стовпець 24 знаходиься 'Людина'");
  });
})

describe("Словник", () => {
  test('типовий обʼект', () => {
    const data = parse(`(а=2, "б"="2", в=[], г=(), Ґ=Книжка(), 999=238)`);
    expect(data).toEqual(new DictionaryNode([
      new DictionaryEntryNode(new TextNode("а"), new NumberNode(2)),
      new DictionaryEntryNode(new TextNode("б"), new TextNode("2")),
      new DictionaryEntryNode(new TextNode("в"), new ListNode([])),
      new DictionaryEntryNode(new TextNode("г"), new DictionaryNode([])),
      new DictionaryEntryNode(new TextNode("Ґ"), new ObjectNode("Книжка", [])),
      new DictionaryEntryNode(new NumberNode(999), new NumberNode(238)),
    ]));
  });
  test('пропуск коми дає помилку', () => {
    expect(() => parse(`(а=2, "б"="2", є=[] Ї=(), Ґ=Книжка(), 999=238)`))
      .toThrow("Очікувалася кома. Замість цього на рядку 1 стовпець 21 знаходиься 'Ї'");
  });
})