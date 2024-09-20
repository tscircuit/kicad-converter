import { test, expect } from "bun:test"
import { Circuit } from "@tscircuit/core"
import { circuitJsonToPcbSvg } from "circuit-to-svg"
import { convertCircuitJsonToKiCadPcb } from "lib/kicad-pcb/convert-circuit-json-to-kicad-pcb"
import { convertKiCadPcbToSExprString } from "lib/kicad-pcb/convert-kicad-pcb-to-sexpr-string"
import macrokeypadCircuitJson from "tests/assets/macrokeypad/macrokeypad.json"
import { convertKiCadPcbToCircuitJson } from "lib/kicad-pcb/convert-kicad-pcb-to-circuit-json"
import { MacroKeypad } from "tests/fixtures/keyboard"

test("circuit json to kicad pcb2", () => {
  const circuit = new Circuit()

  circuit.add(<MacroKeypad />)
  circuit.render()

  const kicadPcb = convertCircuitJsonToKiCadPcb(circuit.getCircuitJson())

  const reconvertedCircuitJson = convertKiCadPcbToCircuitJson(kicadPcb)

  expect(
    reconvertedCircuitJson.filter((elm) => elm.type === "pcb_hole"),
  ).toHaveLength(2 * 9)

  expect(circuitJsonToPcbSvg(reconvertedCircuitJson)).toMatchSvgSnapshot(
    import.meta.path,
  )
})
