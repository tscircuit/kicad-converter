import { test, expect } from "bun:test"
import { parseKiCadPcb } from "lib/kicad-pcb/parse-kicad-pcb-sexpr"
import { convertKiCadPcbToCircuitJson } from "lib/kicad-pcb/convert-kicad-pcb-to-circuit-json"

/**
 * Test that KiCad PCB files with 'custom' and 'trapezoid' pad shapes can be
 * parsed without ZodError.
 * See: https://github.com/tscircuit/kicad-converter/issues/16
 */
test("parse kicad pcb with custom pad shape does not throw ZodError", () => {
  const kicadPcbContent = `(kicad_pcb
    (version 20240108)
    (generator "pcbnew")
    (generator_version "8.0")
    (general
      (thickness 1.6)
      (legacy_teardrops no)
    )
    (paper "A4")
    (layers
      (0 "F.Cu" signal)
      (31 "B.Cu" signal)
      (36 "B.SilkS" user "B.Silkscreen")
      (37 "F.SilkS" user "F.Silkscreen")
      (38 "B.Mask" user "B.Mask")
      (39 "F.Mask" user "F.Mask")
      (44 "Edge.Cuts" user)
    )
    (setup
      (pad_to_mask_clearance 0)
      (allow_soldermask_bridges_in_footprints no)
      (pcbplotparams
        (layerselection 0x00010fc_ffffffff)
        (plot_on_all_layers_selection 0x0000000_00000000)
        (disableapertmacros no)
        (usegerberextensions no)
        (usegerberattributes yes)
        (usegerberadvancedattributes yes)
        (creategerberjobfile yes)
        (dashed_line_dash_ratio 12.000000)
        (dashed_line_gap_ratio 3.000000)
        (svgprecision 4)
        (plotframeref no)
        (viasonmask no)
        (mode 1)
        (useauxorigin no)
        (hpglpennumber 1)
        (hpglpenspeed 20)
        (hpglpendiameter 15.000000)
        (pdf_front_fp_property_popups yes)
        (pdf_back_fp_property_popups yes)
        (dxfpolygonmode yes)
        (dxfimperialunits yes)
        (dxfusepcbnewfont yes)
        (psnegative no)
        (psa4output no)
        (plotreference yes)
        (plotvalue yes)
        (plotfptext yes)
        (plotinvisibletext no)
        (sketchpadsonfab no)
        (subtractmaskfromsilk no)
        (outputformat 1)
        (mirror no)
        (drillshape 1)
        (scaleselection 1)
        (outputdirectory "")
      )
    )
    (net 0 "")
    (net 1 "GND")
    (footprint "CustomPadFootprint"
      (layer "F.Cu")
      (uuid "aabbccdd-1111-2222-3333-444455556666")
      (at 100 100)
      (property "Reference" "U1"
        (at 0 -3)
        (layer "F.SilkS")
        (effects (font (size 1 1) (thickness 0.15)))
      )
      (pad "1" smd custom
        (at -1.27 0)
        (size 0.6 0.6)
        (layers "F.Cu" "F.Mask")
        (net 1 "GND")
      )
      (pad "2" smd custom
        (at 1.27 0)
        (size 0.6 0.6)
        (layers "F.Cu" "F.Mask")
        (net 1 "GND")
      )
      (pad "3" smd rect
        (at 0 1.27)
        (size 1.0 0.5)
        (layers "F.Cu" "F.Mask")
        (net 1 "GND")
      )
    )
  )`

  // This should not throw a ZodError
  const kicadPcb = parseKiCadPcb(kicadPcbContent)

  expect(kicadPcb.footprints.length).toBe(1)
  expect(kicadPcb.footprints[0].pads!.length).toBe(3)
  expect(kicadPcb.footprints[0].pads![0].shape).toBe("custom")
  expect(kicadPcb.footprints[0].pads![1].shape).toBe("custom")
  expect(kicadPcb.footprints[0].pads![2].shape).toBe("rect")

  // Custom pads should convert to circuit JSON without error
  const circuitJson = convertKiCadPcbToCircuitJson(kicadPcb)

  // Custom pads should be converted to smtpads with rect shape
  const smtpads = circuitJson.filter((el: any) => el.type === "pcb_smtpad")
  expect(smtpads.length).toBeGreaterThanOrEqual(2)

  // Verify custom pads are mapped to "rect" shape
  const customPads = smtpads.filter(
    (pad: any) =>
      pad.port_hints?.includes("1") || pad.port_hints?.includes("2"),
  )
  for (const pad of customPads) {
    expect((pad as any).shape).toBe("rect")
  }
})

test("parse kicad pcb with trapezoid pad shape", () => {
  const kicadPcbContent = `(kicad_pcb
    (version 20240108)
    (generator "pcbnew")
    (generator_version "8.0")
    (general
      (thickness 1.6)
      (legacy_teardrops no)
    )
    (paper "A4")
    (layers
      (0 "F.Cu" signal)
      (31 "B.Cu" signal)
      (36 "B.SilkS" user "B.Silkscreen")
      (37 "F.SilkS" user "F.Silkscreen")
      (38 "B.Mask" user "B.Mask")
      (39 "F.Mask" user "F.Mask")
      (44 "Edge.Cuts" user)
    )
    (setup
      (pad_to_mask_clearance 0)
      (allow_soldermask_bridges_in_footprints no)
      (pcbplotparams
        (layerselection 0x00010fc_ffffffff)
        (plot_on_all_layers_selection 0x0000000_00000000)
        (disableapertmacros no)
        (usegerberextensions no)
        (usegerberattributes yes)
        (usegerberadvancedattributes yes)
        (creategerberjobfile yes)
        (dashed_line_dash_ratio 12.000000)
        (dashed_line_gap_ratio 3.000000)
        (svgprecision 4)
        (plotframeref no)
        (viasonmask no)
        (mode 1)
        (useauxorigin no)
        (hpglpennumber 1)
        (hpglpenspeed 20)
        (hpglpendiameter 15.000000)
        (pdf_front_fp_property_popups yes)
        (pdf_back_fp_property_popups yes)
        (dxfpolygonmode yes)
        (dxfimperialunits yes)
        (dxfusepcbnewfont yes)
        (psnegative no)
        (psa4output no)
        (plotreference yes)
        (plotvalue yes)
        (plotfptext yes)
        (plotinvisibletext no)
        (sketchpadsonfab no)
        (subtractmaskfromsilk no)
        (outputformat 1)
        (mirror no)
        (drillshape 1)
        (scaleselection 1)
        (outputdirectory "")
      )
    )
    (net 0 "")
    (footprint "TrapezoidPadFootprint"
      (layer "F.Cu")
      (uuid "11223344-5566-7788-9900-aabbccddeeff")
      (at 50 50)
      (property "Reference" "U2"
        (at 0 -3)
        (layer "F.SilkS")
        (effects (font (size 1 1) (thickness 0.15)))
      )
      (pad "1" smd trapezoid
        (at 0 0)
        (size 1.0 0.8)
        (layers "F.Cu" "F.Mask")
      )
    )
  )`

  const kicadPcb = parseKiCadPcb(kicadPcbContent)

  expect(kicadPcb.footprints.length).toBe(1)
  expect(kicadPcb.footprints[0].pads![0].shape).toBe("trapezoid")

  const circuitJson = convertKiCadPcbToCircuitJson(kicadPcb)
  const smtpads = circuitJson.filter((el: any) => el.type === "pcb_smtpad")
  expect(smtpads.length).toBeGreaterThanOrEqual(1)
  expect((smtpads[0] as any).shape).toBe("rect")
})
