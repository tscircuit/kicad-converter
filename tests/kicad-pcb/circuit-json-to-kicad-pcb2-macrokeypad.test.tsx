import { test, expect } from "bun:test"
import { Circuit } from "@tscircuit/core"
import { circuitJsonToPcbSvg } from "circuit-to-svg"
import { convertCircuitJsonToKiCadPcb } from "lib/kicad-pcb/convert-circuit-json-to-kicad-pcb"
import { convertKiCadPcbToSExprString } from "lib/kicad-pcb/convert-kicad-pcb-to-sexpr-string"
import macrokeypadCircuitJson from "tests/assets/macrokeypad/macrokeypad.json"
import { convertKiCadPcbToCircuitJson } from "lib/kicad-pcb/kicad-pcb-to-circuit-json"

test("circuit json to kicad pcb2", () => {
  const kicadPcb = convertCircuitJsonToKiCadPcb(macrokeypadCircuitJson as any)

  const reconvertedCircuitJson = convertKiCadPcbToCircuitJson(kicadPcb)

  expect(circuitJsonToPcbSvg(reconvertedCircuitJson)).toMatchSvgSnapshot(
    import.meta.path,
  )
})
