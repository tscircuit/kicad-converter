import { test } from "bun:test"
import assert from "node:assert/strict"
import { parseSExpr, type SExpr } from "../../lib/common/parse-sexpr"
import { parseKicadSch } from "../../lib/kicad-sch/parse-kicad-sch"

const expressions: Array<{ name: string; input: string; expected: SExpr }> = [
  { name: "quoted opening parenthesis", input: '(root "(")', expected: ["root", "("] },
  { name: "quoted closing parenthesis", input: '(root ")")', expected: ["root", ")"] },
  { name: "both quoted delimiters", input: '(root "(" ")")', expected: ["root", "(", ")"] },
  { name: "nested lists with quoted delimiters", input: '(root (child "(") (child ")") (tail ok))', expected: ["root", ["child", "("], ["child", ")"], ["tail", "ok"]] },
  { name: "siblings after a quoted closing parenthesis", input: '(root (value ")") (next "kept"))', expected: ["root", ["value", ")"], ["next", "kept"]] },
  { name: "repeated quoted delimiters", input: '(root "(" "(" ")" ")")', expected: ["root", "(", "(", ")", ")"] },
  { name: "empty quoted strings", input: '(root "" (child ""))', expected: ["root", "", ["child", ""]] },
  { name: "ordinary bare atoms and structural parentheses", input: "(root 12 -3.5 (child text))", expected: ["root", "12", "-3.5", ["child", "text"]] },
  { name: "whitespace around structural delimiters", input: ' \n(root\t"("\n(child ")") )\r\n', expected: ["root", "(", ["child", ")"]] },
  { name: "parentheses inside longer strings", input: '(root "a(b)c" "((" "))" "()")', expected: ["root", "a(b)c", "((", "))", "()"] },
  { name: "top-level quoted opening parenthesis", input: '"("', expected: ["("] },
  { name: "top-level quoted closing parenthesis", input: '")"', expected: [")"] },
]

for (const { name, input, expected } of expressions) {
  test("parseSExpr preserves " + name, () => {
    assert.deepEqual(parseSExpr(input), expected)
  })
}

function schematic(value: string, propertyName = "Value", symbolName = "Device:R") {
  return [
    "(kicad_sch",
    "(version 20231120)",
    '(generator "eeschema")',
    '(generator_version "8.0")',
    '(uuid "12345678-1234-1234-1234-123456789abc")',
    '(paper "A4")',
    '(lib_symbols (symbol "' + symbolName + '"',
    '(property "' + propertyName + '" "' + value + '")',
    '(property "Reference" "R" (at 0 1 90))))',
    '(sheet_instances (path "/" (page "1"))))',
  ].join("\n")
}

for (const value of ["(", ")", "plain", "a(b)c", "", "123", "日本語", "x y"]) {
  test("schematic property value " + JSON.stringify(value) + " preserves following fields", () => {
    const parsed = parseKicadSch(parseSExpr(schematic(value)))
    assert.equal(parsed.version, 20231120)
    assert.equal(parsed.generator, "eeschema")
    assert.deepEqual(parsed.lib_symbols?.symbols[0].properties, [
      { name: "Value", value },
      { name: "Reference", value: "R", at: { x: 0, y: 1, rotation: 90 } },
    ])
    assert.deepEqual(parsed.sheet_instances, { path: { path: "/", page: "1" } })
  })
}

for (const name of ["(", ")"]) {
  test("schematic property name " + JSON.stringify(name) + " remains a string", () => {
    const parsed = parseKicadSch(parseSExpr(schematic("kept", name)))
    assert.deepEqual(parsed.lib_symbols?.symbols[0].properties?.[0], {
      name,
      value: "kept",
    })
    assert.equal(parsed.lib_symbols?.symbols[0].properties?.[1].value, "R")
  })

  test("schematic symbol name " + JSON.stringify(name) + " preserves its properties", () => {
    const parsed = parseKicadSch(parseSExpr(schematic("kept", "Value", name)))
    assert.equal(parsed.lib_symbols?.symbols[0].name, name)
    assert.equal(parsed.lib_symbols?.symbols[0].properties?.[0].value, "kept")
    assert.equal(parsed.lib_symbols?.symbols[0].properties?.[1].value, "R")
  })
}
