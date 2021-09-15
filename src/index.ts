import { liftAs, sentence, many, sat, Parser, token, some, aphaNumeric, char, alts, unpack, alt } from "monpar";

type Attributes = Record<string, string>
interface Tag {
  element: string
  attributes: Attributes
}
export interface PTree extends Tag {
  children: PTree[]
  value: string
}

// https://html.spec.whatwg.org/#attributes-2
const charInAttributeName = sat(c => ![" ", "\"", "'", ">", "/", "="].includes(c));

// ="value"
// -> value
const doubleQuotedValue = liftAs(
  () => (value: string[]) => () => value.join(""),
  sentence("=\""),
  many(sat(c => c !== "\"")),
  char("\""),
);

// ='value' -> value
const singleQuotedValue = liftAs(
  () => (value: string[]) => () => value.join(""),
  sentence("='"),
  many(sat(c => c !== "'")),
  char("'"),
);

// key="value" / key='value'
// => { key: value }
export const parseAttribute = liftAs(
  (key: string[]) => (value: string) => ({ [key.join("")]: value }),
  many(charInAttributeName),
  alt(doubleQuotedValue, () => singleQuotedValue),
);

// key="value" key2="value2" key3='value3'
// -> { key: value, key2: value2, key3: value3 }
export const parseAttributes = liftAs<Attributes>(
  (attributes: Attributes[]) => attributes.reduce((acc, curr) => ({ ...acc, ...curr }), {}),
  many(token(parseAttribute)),
);

// <p key="value">
// -> { element: p, attributes: { key: value }}
export const openingTag = liftAs<Tag>(
  () => (tag: string[]) => (attributes: Attributes) => () => ({ element: tag.join(""), attributes }),
  char("<"),
  token(many(aphaNumeric)),
  parseAttributes,
  char(">"),
);

// </div>
// -> div
export const closingTag: Parser<string> = liftAs(
  () => (tag: string[]) => () => tag.join(""),
  sentence("</"),
  token(many(aphaNumeric)),
  char(">"),
);

// <img key="value"/>
// -> { element: img, attributes: { key: value }, value: "", children: [] }
// NOTE: This does not parse self closing elements that do not include the slash (which is allowed in HTML5)
export const selfClosingElement: Parser<PTree> = liftAs<PTree>(
  () => (elm: string[]) => (attributes: Attributes) => () => ({ element: elm.join(""), attributes, value: "", children: [] }),
  char("<"),
  token(many(aphaNumeric)),
  parseAttributes,
  sentence("/>"),
);

// This is inner text</p>
// -> { element: "innerText", value: "This is inner text", children: [], attributes: {} }
export const innerHTMLText: Parser<PTree> = liftAs(
  (out: string[]) => ({ element: "innerText", value: out.join(""), children: [], attributes: {} }),
  some(sat(c => c !== "<")),
);

// This is a bit of a special case where we just want to peek ahead if we've come across a closing element
// straight away. In case of `<body></body>` for example. If this is the case, return empty innertext element and
// pass the input along so that `closingTag` can take care of the `</body>`.
const noContents: Parser<PTree[]> = inp => {
  return inp.slice(0, 2) === "</" ? [[[{ element: "innerText", value: "", children: [], attributes: {} }], inp]] : [];
};

/*
<body>This is a literal innerText value</body>
-> {
  element: "body",
  attributes: {},
  value: "",
  children: [{
    element: "innerText",
    value: "This is a literal innerText value",
    attributes: {},
    children: [],
  }]
}
*/
export const element = (): Parser<PTree> => liftAs(
  (attributes: Attributes) => (children: (PTree)[] ) => () => {
    return { ...attributes, children, value: "" };
  },
  token(openingTag),
  alt(noContents, () => some(token(node))),
  token(closingTag),
);

export const node = alts(() => innerHTMLText, () => selfClosingElement, element);

export const parseNodes = element();
export const parseHTML = unpack(element());
export default parseHTML;
