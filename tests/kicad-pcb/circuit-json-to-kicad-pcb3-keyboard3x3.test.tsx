import { test, expect } from "bun:test"
import { MacroKeypad } from "tests/fixtures/keyboard"
import { Circuit } from "@tscircuit/core"
import { convertCircuitJsonToKiCadPcb } from "lib/kicad-pcb/convert-circuit-json-to-kicad-pcb"
import { convertKiCadPcbToSExprString } from "lib/kicad-pcb/convert-kicad-pcb-to-sexpr-string"

test("example3-3x3-keyboard", () => {
  const circuit = new Circuit()

  circuit.add(<MacroKeypad />)

  const circuitJson = circuit.getCircuitJson()

  const kicadPcb = convertCircuitJsonToKiCadPcb(circuitJson)

  const sexpr = convertKiCadPcbToSExprString(kicadPcb)

  // Bun.write("test-artifact.kicad_pcb", sexpr)
})
