import { test, expect } from "bun:test"
import { MacroKeypad } from "tests/fixtures/keyboard"
import { Circuit } from "tscircuit"
import { convertCircuitJsonToKiCadPcb } from "lib/kicad-pcb/convert-circuit-json-to-kicad-pcb"
import { convertKiCadPcbToSExprString } from "lib/kicad-pcb/convert-kicad-pcb-to-sexpr-string"
import { parseKiCadPcb } from "lib/kicad-pcb/parse-kicad-pcb-sexpr"
import { convertKiCadPcbToCircuitJson } from "lib/kicad-pcb/convert-kicad-pcb-to-circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("example3-3x3-keyboard", async () => {
  const circuit = new Circuit()

  circuit.add(<MacroKeypad />)

  await circuit.renderUntilSettled()

  const circuitJson = circuit.getCircuitJson()

  const kicadPcb = convertCircuitJsonToKiCadPcb(circuitJson as any)

  const sexpr = convertKiCadPcbToSExprString(kicadPcb)

  const reconstructedCircuitJson = convertKiCadPcbToCircuitJson(
    parseKiCadPcb(sexpr),
  )

  expect(
    convertCircuitJsonToPcbSvg(reconstructedCircuitJson),
  ).toMatchSvgSnapshot(import.meta.path)
})
