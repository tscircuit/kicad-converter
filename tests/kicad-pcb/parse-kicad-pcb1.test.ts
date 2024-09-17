import { test, expect } from "bun:test"
import { parseSExpr, parseKiCadPcb } from "lib/kicad-pcb/kicad-pcb-parser"
import { KiCadPcbSchema } from "lib/kicad-pcb/zod"
// @ts-ignore
import testKiCadPcb from "../assets/testkicadproject/testkicadproject.kicad_pcb" with {
  type: "text",
}
import { convertKiCadPcbToCircuitJson } from "lib/kicad-pcb/kicad-pcb-to-circuit-json"
import { circuitJsonToPcbSvg } from "circuit-to-svg"
import { any_circuit_element } from "@tscircuit/soup"
import { z } from "zod"

test("parse-kicad-pcb1", () => {
  const sexpr = parseSExpr(testKiCadPcb)
  const kicadPcb = parseKiCadPcb(sexpr)

  expect(kicadPcb.version).toBeDefined()
  expect(kicadPcb.layers).toBeDefined()
  expect(kicadPcb.layers.length).toBe(29)

  const circuitJson = convertKiCadPcbToCircuitJson(kicadPcb)

  expect(circuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(import.meta.path)
})
