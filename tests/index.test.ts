import { closingTag, openingTag, parseAttribute, parseAttributes, element, selfClosingElement, parseNodes } from "../src"


describe("HTMLparser tests", () => {
  test("Parse one attribute of tag", () => {
    expect(parseAttribute('id="speechify-heading"')).toStrictEqual([[{ id: "speechify-heading" }, ""]])
  })

  test("Parse attributes double quotes", () => {
    expect(parseAttributes('id="speechify-heading" class="paragraph"')).toStrictEqual([[{ id: "speechify-heading", class: "paragraph" }, ""]])
  })

  test("Parse attributes single quotes", () => {
    expect(parseAttributes('id=\'speechify-heading\' class=\'paragraph\'')).toStrictEqual([[{ id: "speechify-heading", class: "paragraph" }, ""]])
  })

  test("Parse HTML opening tag", () => {
    expect(openingTag('<div id="speechify-heading">')).toStrictEqual([
      [{
        element: "div",
        attributes: {
          id: "speechify-heading",
        }
      }, '']
    ])
  })

  test("Parse HTML closing tag", () => {
    expect(closingTag('</div>')).toStrictEqual([["div", ""]])
  })

  test("Parse empty body", () => {
    expect(parseNodes('<html><body></body></html>')).toStrictEqual([[{
      element: "html",
      value: "",
      attributes: {},
      children: [{
        element: "body",
        value: "",
        attributes: {},
        children: [{
          element: "innerText",
          value: "",
          attributes: {},
          children: [],
        }]
      }]
    }, ""]])
  })

  test("parseNodes, nested HTML elements, no siblings", () => {
    expect(parseNodes(`<html>
    <body>
        <div id="speechify-heading">
          <p>Speechify helps you listen to any readable content on the web.</p>
        </div>
    </body>
    </html>`)).toStrictEqual([[
      {
        element: "html",
        value: "",
        attributes: {},
        children: [{
          element: "body",
          value: "",
          attributes: {},
          children: [{
            element: "div",
            value: "",
            attributes: {
              id: "speechify-heading"
            },
            children: [{
              element: "p",
              value: "",
              attributes: {},
              children: [{
                element: "innerText",
                value: "Speechify helps you listen to any readable content on the web.",
                attributes: {},
                children: [],
              }],
            }],
          }]
        }]
      }, ""
    ]])
  })

  test("ParseElements, nested HTML elements, no siblings", () => {
    expect(element()(`<html>
    <body>
        <div id="speechify-heading">
          <p>Speechify helps you listen to any readable content on the web.</p>
        </div>
    </body>
    </html>`)).toStrictEqual([
      [
        {
          element: "html",
          value: "",
          attributes: {},
          children: [{
            element: "body",
            value: "",
            attributes: {},
            children: [{
              element: "div",
              value: "",
              attributes: {
                id: "speechify-heading"
              },
              children: [{
                element: "p",
                value: "",
                attributes: {},
                children: [
                  { 
                    element: "innerText",
                    value: "Speechify helps you listen to any readable content on the web.",
                    attributes: {},
                    children: [],
                  },
                ]
              }]
            }]
          }]
        },
        ""
      ]
    ])
  })

  test("ParseElements, nested HTML elements, with siblings", () => {
    expect(element()(`<html>
    <body>
        <div id="speechify-heading">
          <p>Speechify helps you listen to any readable content on the web.</p>
          <p class="bold">The product works on web articles, PDFs and Google Docs.</p>
        </div>
    </body>
    </html>`)).toStrictEqual([
      [
        {
          element: "html",
          value: "",
          attributes: {},
          children: [{
            element: "body",
            value: "",
            attributes: {},
            children: [{
              element: "div",
              value: "",
              attributes: {
                id: "speechify-heading"
              },
              children: [
                {
                  element: "p",
                  value: "",
                  attributes: {},
                  children: [{
                    children: [],
                    attributes: {},
                    element: "innerText",
                    value: "Speechify helps you listen to any readable content on the web."
                  }]
                },
                {
                  element: "p",
                  value: "",
                  attributes: {
                    class: "bold",
                  },
                  children: [{
                    children: [],
                    attributes: {},
                    element: "innerText",
                    value: "The product works on web articles, PDFs and Google Docs."
                  }]
                },
              ]
            }]
          }]
        },
        ""
      ]
    ])
  })

  test("SelfClosingElement, parse self closing tag", () => {
    expect(selfClosingElement('<img src="https://url.com" height="100px" width="100px"/>')).toStrictEqual([[
      {
        element: "img",
        value: "",
        children: [],
        attributes: {
          src: "https://url.com",
          height: "100px",
          width: "100px",
        },
      }, ""
    ]])
  })

  test("parseNodes, parse self closing tag", () => {
    expect(parseNodes('<html><body><img src="https://url.com" height="100px" width="100px"/></body></html>')).toStrictEqual([[
      {
        element: "html",
        value: "",
        attributes: {},
        children: [{
          element: "body",
          value: "",
          attributes: {},
          children: [{
            element: "img",
            value: "",
            children: [],
            attributes: {
              src: "https://url.com",
              height: "100px",
              width: "100px",
            },
          }]
        }]
      }, ""
    ]])
  })

  test("parseNodes, parse mixed contents", () => {
    expect(parseNodes(`
      <html>
        <body>
          <h1>Title</h1>
          <div class="mainContent">
            <img src="https://url.com" height="100px" width="100px"/>
          </div>
        </body>
      </html>`
    )).toStrictEqual([[
      {
        element: "html",
        value: "",
        attributes: {},
        children: [
          {
            element: "body",
            value: "",
            attributes: {},
            children: [
              {
                element: "h1",
                value: "",
                attributes: {},
                children: [{
                  element: "innerText",
                  value: "Title",
                  attributes: {},
                  children: [],
                }],
              },
              {
                element: "div",
                value: "",
                attributes: {
                  class: "mainContent",
                },
                children: [
                  {
                    element: "img",
                    value: "",
                    children: [],
                    attributes: {
                      src: "https://url.com",
                      height: "100px",
                      width: "100px",
                    },
                  },
                ]
              }
            ]
          }
        ]
      }, ""
    ]])
  })

  test("Should parse literal value", () => {
    expect(parseNodes("<body>This is a literal innerText value</body>")).toStrictEqual([[{
        element: "body",
        attributes: {},
        value: "",
        children: [{
          element: "innerText",
          value: "This is a literal innerText value",
          attributes: {},
          children: [],
        }]
      }, ""]
    ])
  })
})
