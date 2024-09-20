import { test, expect } from "bun:test"
import { convertCircuitJsonToKiCadPcb } from "lib/kicad-pcb/convert-circuit-json-to-kicad-pcb"
import * as CJ from "@tscircuit/soup"

test("circuit json to kicad pcb with holes and plated holes", () => {
  const circuitJson: CJ.AnyCircuitElement[] = [
    {
      type: "pcb_hole",
      pcb_hole_id: "hole1",
      x: 10,
      y: 10,
      hole_diameter: 2,
      hole_shape: "round",
    },
    {
      type: "pcb_plated_hole",
      pcb_plated_hole_id: "plated_hole1",
      x: 20,
      y: 20,
      outer_diameter: 3,
      hole_diameter: 1.5,
      shape: "circle",
      layers: ["top", "bottom"],
    },
  ]

  const kicadPcb = convertCircuitJsonToKiCadPcb(circuitJson)

  expect(kicadPcb.footprints).toHaveLength(2)

  const hole = kicadPcb.footprints[0]
  expect(hole.footprint).toBe("MountingHole")
  expect(hole.pads).toHaveLength(1)
  expect(hole.pads![0].type).toBe("np_thru_hole")

  const platedHole = kicadPcb.footprints[1]
  expect(platedHole.footprint).toBe("PlatedHole")
  expect(platedHole.pads).toHaveLength(1)
  expect(platedHole.pads![0].type).toBe("thru_hole")
})
