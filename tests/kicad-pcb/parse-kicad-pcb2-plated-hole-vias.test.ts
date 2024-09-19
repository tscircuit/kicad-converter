import { test, expect } from "bun:test"
import { parseKiCadPcb } from "lib/kicad-pcb/kicad-pcb-parser"
import { parseSExpr } from "lib/common/parse-sexpr"
// @ts-ignore
import testKiCadPcb2 from "../assets/platedholeandvias/platedholeandvias.kicad_pcb" with {
  type: "text",
}
import { convertKiCadPcbToCircuitJson } from "lib/kicad-pcb/kicad-pcb-to-circuit-json"
import { convertCircuitJsonToKiCadPcb } from "lib/kicad-pcb/convert-circuit-json-to-kicad-pcb"
import { convertKiCadPcbToSExprString } from "lib/kicad-pcb/convert-kicad-pcb-to-sexpr-string"
import { circuitJsonToPcbSvg } from "circuit-to-svg"

test("parse-kicad-pcb2 - plated hole and vias", () => {
  const sexpr = parseSExpr(testKiCadPcb2)
  const kicadPcb = parseKiCadPcb(sexpr)

  expect(kicadPcb.version).toBeDefined()
  expect(kicadPcb.layers).toBeDefined()
  expect(kicadPcb.layers.length).toBe(29)

  expect(kicadPcb.vias).toHaveLength(1)

  const circuitJson = convertKiCadPcbToCircuitJson(kicadPcb)

  const vias = circuitJson.filter((elm) => elm.type === "pcb_via")

  expect(vias).toHaveLength(1)

  expect(circuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(import.meta.path)

  // Test the new conversion functions
  const convertedKicadPcb = convertCircuitJsonToKiCadPcb(circuitJson)
  expect(convertedKicadPcb.version).toBeDefined()
  expect(convertedKicadPcb.layers).toBeDefined()

  const sexprString = convertKiCadPcbToSExprString(convertedKicadPcb)
  expect(sexprString).toContain("(kicad_pcb")
  expect(sexprString).toContain("(version")
  expect(sexprString).toContain("(layers")
})
