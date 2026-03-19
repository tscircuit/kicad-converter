import { expect, test } from "bun:test"
import { parseSExpr } from "lib/common/parse-sexpr"
import { convertKiCadPcbToCircuitJson } from "lib/kicad-pcb/convert-kicad-pcb-to-circuit-json"
import { parseKiCadPcb } from "lib/kicad-pcb/parse-kicad-pcb-sexpr"

// Minimal KiCad PCB string containing a footprint with a "custom" type pad
// to verify that the parser and converter handle newer KiCad pad types without
// throwing a ZodError (regression test for issue #16).
const kicadPcbWithCustomPad = `
(kicad_pcb
  (version 20221018)
  (generator pcbnew)
  (generator_version "7.0")
  (general
    (thickness 1.6)
    (legacy_teardrops no)
  )
  (paper "A4")
  (layers
    (0 "F.Cu" signal)
    (31 "B.Cu" signal)
    (32 "B.Adhes" user "B.Adhesive")
    (33 "F.Adhes" user "F.Adhesive")
    (34 "B.Paste" user)
    (35 "F.Paste" user)
    (36 "B.SilkS" user "B.Silkscreen")
    (37 "F.SilkS" user "F.Silkscreen")
    (38 "B.Mask" user)
    (39 "F.Mask" user)
    (40 "Dwgs.User" user "User.Drawings")
    (41 "Cmts.User" user "User.Comments")
    (42 "Eco1.User" user "User.Eco1")
    (43 "Eco2.User" user "User.Eco2")
    (44 "Edge.Cuts" user)
    (45 "Margin" user)
    (46 "B.CrtYd" user "B.Courtyard")
    (47 "F.CrtYd" user "F.Courtyard")
    (48 "B.Fab" user "B.Fabrication")
    (49 "F.Fab" user "F.Fabrication")
    (50 "User.1" user)
    (51 "User.2" user)
    (52 "User.3" user)
    (53 "User.4" user)
    (54 "User.5" user)
    (55 "User.6" user)
    (56 "User.7" user)
    (57 "User.8" user)
    (58 "User.9" user)
  )
  (setup
    (pad_to_mask_clearance 0)
    (allow_soldermask_bridges_in_footprints no)
    (pcbplotparams
      (plot_on_all_layers_selection 0x00010fc_ffffffff)
      (svgprecision 4)
      (hpglpennumber 1)
    )
  )
  (net 0 "")
  (net 1 "GND")
  (footprint "CustomPadTest:TestPad"
    (layer "F.Cu")
    (uuid "aaaabbbb-cccc-dddd-eeee-ffffffffffff")
    (at 100 100)
    (pad "1" custom rect
      (at 0 0)
      (size 1.5 1.5)
      (layers "F.Cu" "F.Mask")
      (net 1 "GND")
      (uuid "11112222-3333-4444-5555-666677778888")
    )
  )
)
`

test("parse KiCad PCB with custom pad type without ZodError", () => {
  const sexpr = parseSExpr(kicadPcbWithCustomPad)
  const kicadPcb = parseKiCadPcb(sexpr)

  expect(kicadPcb.footprints).toHaveLength(1)
  const pad = kicadPcb.footprints[0].pads?.[0]
  expect(pad).toBeDefined()
  expect(pad?.type).toBe("custom")

  // Converting should NOT throw a ZodError
  const circuitJson = convertKiCadPcbToCircuitJson(kicadPcb)

  // The custom pad should be emitted as a pcb_smtpad
  const smtpads = circuitJson.filter((el) => el.type === "pcb_smtpad")
  expect(smtpads.length).toBeGreaterThan(0)
})
