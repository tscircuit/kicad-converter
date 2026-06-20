import { test, expect } from "bun:test"
import { parseKiCadPcb } from "lib/kicad-pcb/parse-kicad-pcb-sexpr"

// KiCad 10 (board version 2024xxxx+) writes nets by NAME only — `(net "GND")` —
// with no top-level numeric net table. Older KiCad wrote `(net 5 "GND")` plus a
// table. The parser must handle both: synthesize stable numeric ids for the
// name-only form, preserve names, and rebuild the net table.
const KICAD10_PCB = `
(kicad_pcb
  (version 20260206)
  (generator "pcbnew")
  (generator_version "10.0")
  (general (thickness 1.6) (legacy_teardrops no))
  (paper "A4")
  (layers (0 "F.Cu" signal) (31 "B.Cu" signal))
  (setup
    (pad_to_mask_clearance 0)
    (allow_soldermask_bridges_in_footprints no)
    (pcbplotparams (plot_on_all_layers_selection "0x0000000_00000000") (svgprecision 4))
  )
  (footprint "Resistor_SMD:R_0805" (layer "F.Cu") (uuid "r1") (at 10 10)
    (pad "1" smd roundrect (at -1 0) (size 1 1) (layers "F.Cu") (net "GND"))
    (pad "2" smd roundrect (at 1 0) (size 1 1) (layers "F.Cu") (net "+5V"))
  )
  (footprint "Capacitor_SMD:C_0805" (layer "F.Cu") (uuid "c1") (at 20 20)
    (pad "1" smd roundrect (at -1 0) (size 1 1) (layers "F.Cu") (net "GND"))
    (pad "2" smd roundrect (at 1 0) (size 1 1) (layers "F.Cu") (net "+5V"))
  )
)
`

test("parse-kicad-pcb: KiCad 10 name-based nets resolve to numeric ids", () => {
  const pcb = parseKiCadPcb(KICAD10_PCB)

  // every pad net id is a real number (was NaN before the fix)
  const pads = pcb.footprints.flatMap((f) => f.pads ?? [])
  expect(pads.length).toBe(4)
  for (const pad of pads) {
    expect(pad.net).toBeDefined()
    expect(Number.isFinite(pad.net!.id)).toBe(true)
  }

  // same net name -> same id across components; different names -> different ids
  const gndIds = pads.filter((p) => p.net?.name === "GND").map((p) => p.net!.id)
  const v5Ids = pads.filter((p) => p.net?.name === "+5V").map((p) => p.net!.id)
  expect(new Set(gndIds).size).toBe(1)
  expect(new Set(v5Ids).size).toBe(1)
  expect(gndIds[0]).not.toBe(v5Ids[0])

  // the net table was rebuilt from the name-only pads (plus net 0 = "")
  expect(pcb.nets.map((n) => n.name).sort()).toEqual(["", "+5V", "GND"])
})

test("parse-kicad-pcb: legacy numeric `(net id name)` form still parses", () => {
  const legacy = KICAD10_PCB.replaceAll(
    '(net "GND")',
    '(net 1 "GND")',
  ).replaceAll('(net "+5V")', '(net 2 "+5V")')
  const pcb = parseKiCadPcb(legacy)
  const pads = pcb.footprints.flatMap((f) => f.pads ?? [])
  expect(pads.find((p) => p.net?.name === "GND")?.net?.id).toBe(1)
  expect(pads.find((p) => p.net?.name === "+5V")?.net?.id).toBe(2)
})
