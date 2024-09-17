import { test, expect } from "bun:test"
import { parseSExpr, parseKiCadPcb } from "lib/kicad-pcb/kicad-pcb-parser"
import { KiCadPcbSchema } from "lib/kicad-pcb/zod"
// @ts-ignore
import testKiCadPcb from "../assets/testkicadproject/testkicadproject.kicad_pcb" with {
  type: "text",
}

test("parse-kicad-pcb1", () => {
  const sexpr = parseSExpr(testKiCadPcb)
  const kicadPcb = parseKiCadPcb(sexpr)

  expect(kicadPcb.version).toBeDefined()
  expect(kicadPcb.layers).toBeDefined()
  expect(kicadPcb.layers.length).toBe(29)
})
