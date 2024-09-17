import type { Footprint, GrRect, KiCadPcb, Pad, Segment } from "./types"
import * as CJ from "@tscircuit/soup"

export function convertKiCadPcbToCircuitJson(
  kicadPcb: KiCadPcb,
): CJ.AnyCircuitElement[] {
  const circuitJsonArray: CJ.AnyCircuitElement[] = []

  // Convert footprints to pcb_components
  if (kicadPcb.footprints) {
    for (const footprint of kicadPcb.footprints) {
      // const pcbComponent = convertFootprintToPcbComponent(footprint)
      // circuitJsonArray.push(pcbComponent)

      // Convert pads to pcb_smtpad or pcb_plated_hole
      if (footprint.pads) {
        for (const pad of footprint.pads) {
          const pcbPads = convertPadToPcbPad(pad, footprint)
          circuitJsonArray.push(...pcbPads)
        }
      }
    }
  }

  // Convert segments to pcb_traces
  if (kicadPcb.segments) {
    const segmentsByNet = groupSegmentsByNet(kicadPcb.segments)
    for (const netId in segmentsByNet) {
      const segments = segmentsByNet[netId]
      const pcbTraces = convertSegmentsToPcbTraces(segments, netId)
      circuitJsonArray.push(...pcbTraces)
    }
  }

  // Convert gr_rects to pcb_silkscreen_rect
  // if (kicadPcb.gr_rects) {
  //   for (const grRect of kicadPcb.gr_rects) {
  //     const silkscreenRect = convertGrRectToSilkscreen(grRect)
  //     circuitJsonArray.push(silkscreenRect)
  //   }
  // }

  return circuitJsonArray
}

// Helper function to generate unique IDs
function generateUniqueId(): string {
  return "id_" + Math.random().toString(36).substr(2, 9)
}

// Convert KiCad Footprint to pcb_component
function convertFootprintToPcbComponent(footprint: Footprint): CJ.PcbComponent {
  return CJ.pcb_component.parse({
    type: "pcb_component",
    pcb_component_id: footprint.uuid || generateUniqueId(),
    source_component_id: footprint.footprint,
    center: {
      x: footprint.at.x,
      y: footprint.at.y,
    },
    layer: mapLayer(footprint.layer),
    rotation: CJ.rotation.parse(
      footprint.at.rotation ? `${footprint.at.rotation}deg` : "0deg",
    ),
  })
}

// Convert KiCad Pad to pcb_smtpad or pcb_plated_hole
function convertPadToPcbPad(
  pad: Pad,
  footprint: Footprint,
): (CJ.PCBSMTPad | CJ.PCBPlatedHole)[] {
  const pads: (CJ.PCBSMTPad | CJ.PCBPlatedHole)[] = []
  const position = {
    x: pad.at[0] + footprint.at.x,
    y: pad.at[1] + footprint.at.y,
  }

  const padShape = pad.shape.toLowerCase()

  if (pad.type === "smd") {
    for (const kicadLayer of pad.layers) {
      const layer = mapLayer(kicadLayer)
      if (!layer) continue
      if (pad.type === "smd") {
        const pcb_smtpad = CJ.pcb_smtpad.safeParse({
          type: "pcb_smtpad",
          pcb_smtpad_id: pad.uuid || generateUniqueId(),
          shape: padShape === "roundrect" ? "rect" : padShape,
          x: position.x,
          y: position.y,
          width: pad.size[0],
          height: pad.size[1],
          layer: layer,
          port_hints: [pad.number],
          pcb_component_id: footprint.uuid || generateUniqueId(),
          pcb_port_id: pad.uuid || generateUniqueId(),
        })

        if (pcb_smtpad.success) {
          pads.push(pcb_smtpad.data)
        } else {
          console.warn(
            `Failed to parse pcb_smtpad "${pad.uuid}"`,
            pcb_smtpad.error,
          )
        }
      }
    }
  }
  if (pad.type === "thru_hole") {
    // For through-hole pads, assuming hole size is specified in pad size
    const pcb_plated_hole = CJ.pcb_plated_hole.safeParse({
      type: "pcb_plated_hole",
      pcb_plated_hole_id: pad.uuid || generateUniqueId(),
      shape: padShape,
      x: position.x,
      y: position.y,
      outer_width: `${pad.size[0]}mm`,
      outer_height: `${pad.size[1]}mm`,
      hole_width: `${pad.size[0] * 0.5}mm`, // Assuming hole is half the pad size
      hole_height: `${pad.size[1] * 0.5}mm`,
      layers: pad.layers.map(mapLayer).filter(Boolean),
      port_hints: [pad.number],
      pcb_component_id: footprint.uuid || generateUniqueId(),
      pcb_port_id: pad.uuid || generateUniqueId(),
    })

    if (pcb_plated_hole.success) {
      pads.push(pcb_plated_hole.data)
    }
    console.warn(`Failed to parse pcb_plated_hole "${pad.uuid}"`)
  }
  return pads
}

// Group KiCad segments by net ID
function groupSegmentsByNet(segments: Segment[]): {
  [netId: number]: Segment[]
} {
  const segmentsByNet: { [netId: number]: Segment[] } = {}
  for (const segment of segments) {
    if (!segmentsByNet[segment.net]) {
      segmentsByNet[segment.net] = []
    }
    segmentsByNet[segment.net].push(segment)
  }
  return segmentsByNet
}

// Convert KiCad segments to pcb_traces
function convertSegmentsToPcbTraces(segments: Segment[], netId: string): any[] {
  const pcbTraces: CJ.PCBTrace[] = []

  for (const segment of segments) {
    const route = [
      {
        route_type: "wire",
        x: segment.start[0],
        y: segment.start[1],
        width: segment.width,
        layer: mapLayer(segment.layer),
      } as CJ.PCBTrace["route"][number],
      {
        route_type: "wire",
        x: segment.end[0],
        y: segment.end[1],
        width: segment.width,
        layer: mapLayer(segment.layer),
      } as CJ.PCBTrace["route"][number],
    ]

    pcbTraces.push(
      CJ.pcb_trace.parse({
        type: "pcb_trace",
        pcb_trace_id: segment.uuid || generateUniqueId(),
        source_trace_id: `net_${segment.net}`,
        route_thickness_mode: "constant",
        should_round_corners: false,
        route: route,
      }),
    )
  }

  return pcbTraces
}

// Convert KiCad gr_rect to pcb_silkscreen_rect
function convertGrRectToSilkscreen(grRect: GrRect) {
  const centerX = (grRect.start[0] + grRect.end[0]) / 2
  const centerY = (grRect.start[1] + grRect.end[1]) / 2
  const width = Math.abs(grRect.end[0] - grRect.start[0])
  const height = Math.abs(grRect.end[1] - grRect.start[1])

  return CJ.pcb_silkscreen_rect.parse({
    type: "pcb_silkscreen_rect",
    pcb_silkscreen_rect_id: grRect.uuid || generateUniqueId(),
    center: {
      x: `${centerX}mm`,
      y: `${centerY}mm`,
    },
    width: `${width}mm`,
    height: `${height}mm`,
    layer: mapLayer(grRect.layer),
  })
}

// Map KiCad layer names to CircuitJSON layer references
function mapLayer(kicadLayer: string): CJ.LayerRef | null {
  const layerMap: { [key: string]: CJ.LayerRef } = {
    "F.Cu": "top",
    "B.Cu": "bottom",
    "F.SilkS": "top",
    "B.SilkS": "bottom",
    // Add other necessary mappings
  }
  return layerMap[kicadLayer] ?? null
}