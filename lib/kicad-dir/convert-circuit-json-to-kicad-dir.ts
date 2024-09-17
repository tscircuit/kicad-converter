import type { KicadDir } from "./types"
import type { AnyCircuitElement } from "@tscircuit/soup"

export function convertCircuitJsonToKicadDir(
  circuitJson: AnyCircuitElement[],
): KicadDir {
  return {
    kicad_pro: "",
    kicad_sch: "",
    kicad_pcb: "",
    kicad_prl: "",
  }
}
