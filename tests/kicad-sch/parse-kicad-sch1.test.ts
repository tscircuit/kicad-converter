import { test, expect } from "bun:test"
import { parseSExpr } from "lib/common/parse-sexpr"
// @ts-ignore
import testKiCadSch from "../assets/testkicadproject/testkicadproject.kicad_sch" with {
  type: "text",
}
import { parseKicadSch } from "lib/kicad-sch"

test("parse-kicad-sch1", () => {
  const sexpr = parseSExpr(testKiCadSch)
  const kicadSch = parseKicadSch(sexpr)

  expect(kicadSch.version).toBeDefined()
  expect(kicadSch.generator).toBeDefined()
})
