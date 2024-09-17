import { test, expect } from "bun:test"
import { Circuit } from "@tscircuit/core"
import { circuitJsonToPcbSvg } from "circuit-to-svg"

test("circuit json to kicad pcb", () => {
  const circuit = new Circuit()

  circuit.add(
    <board width="10mm" height="10mm">
      <resistor resistance="1k" name="R1" pcbX={-2} footprint="0402" />
      <capacitor capacitance="1uF" name="C1" pcbX={2} footprint="0603" />
      <trace from=".R1 > .pin1" to=".C1 > .pin1" />
    </board>,
  )

  circuit.render()

  const kicadPcbJson = convertCircuitJsonToKiCadPcb(circuit.getCircuitJson())

  const kicadPcbSExprString = convertKiCadPcbToSExprString(kicadPcbJson)

  Bun.write("test-artifact-kicad-pcb.kicad_pcb", kicadPcbSExprString)
})
