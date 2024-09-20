import type { Footprint, GrRect, KiCadPcb, Pad, Segment, Via } from "./types"
import * as CJ from "@tscircuit/soup"
import { transformPCBElements } from "@tscircuit/soup-util"
import { scale } from "transformation-matrix"

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

  if (kicadPcb.vias) {
    for (const via of kicadPcb.vias) {
      const pcbVia = convertViaToPcbVia(via)
      circuitJsonArray.push(pcbVia)
    }
  }

  // Convert gr_rects to pcb_silkscreen_rect
  // if (kicadPcb.gr_rects) {
  //   for (const grRect of kicadPcb.gr_rects) {
  //     const silkscreenRect = convertGrRectToSilkscreen(grRect)
  //     circuitJsonArray.push(silkscreenRect)
  //   }
  // }

  // Center the circuit about (0,0)

  // Flip Y axis to match KiCad
  transformPCBElements(circuitJsonArray, scale(1, -1))

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
    layer: mapKicadLayerToTscircuitLayer(footprint.layer),
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
      const layer = mapKicadLayerToTscircuitLayer(kicadLayer)
      if (!layer) continue
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
  } else if (pad.type === "thru_hole") {
    const isCircular = pad.size[0] === pad.size[1]
    const pcb_plated_hole = CJ.pcb_plated_hole.safeParse(
      isCircular
        ? {
            type: "pcb_plated_hole",
            pcb_plated_hole_id: pad.uuid || generateUniqueId(),
            shape: "circle",
            x: position.x,
            y: position.y,
            outer_diameter: pad.size[0],
            hole_diameter: pad.drill || pad.size[0] * 0.5, // Use drill size if available, otherwise assume half the pad size
            layers: pad.layers
              .map(mapKicadLayerToTscircuitLayer)
              .filter(Boolean) as CJ.LayerRef[],
            port_hints: [pad.number],
            pcb_component_id: footprint.uuid || generateUniqueId(),
            pcb_port_id: pad.uuid || generateUniqueId(),
          }
        : {
            type: "pcb_plated_hole",
            pcb_plated_hole_id: pad.uuid || generateUniqueId(),
            shape: padShape === "oval" ? "oval" : "pill",
            x: position.x,
            y: position.y,
            outer_width: pad.size[0],
            outer_height: pad.size[1],
            hole_width: pad.drill || pad.size[0] * 0.5,
            hole_height: pad.drill || pad.size[1] * 0.5,
            layers: pad.layers
              .map(mapKicadLayerToTscircuitLayer)
              .filter(Boolean) as CJ.LayerRef[],
            port_hints: [pad.number],
            pcb_component_id: footprint.uuid || generateUniqueId(),
            pcb_port_id: pad.uuid || generateUniqueId(),
          },
    )

    if (pcb_plated_hole.success) {
      pads.push(pcb_plated_hole.data)
    } else {
      console.warn(
        `Failed to parse pcb_plated_hole "${pad.uuid}"`,
        pcb_plated_hole.error,
      )
    }
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
        layer: mapKicadLayerToTscircuitLayer(segment.layer),
      } as CJ.PCBTrace["route"][number],
      {
        route_type: "wire",
        x: segment.end[0],
        y: segment.end[1],
        width: segment.width,
        layer: mapKicadLayerToTscircuitLayer(segment.layer),
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
    layer: mapKicadLayerToTscircuitLayer(grRect.layer),
  })
}

// Convert KiCad Via to pcb_via
function convertViaToPcbVia(via: Via): CJ.PCBVia {
  return CJ.pcb_via.parse({
    type: "pcb_via",
    x: `${via.at[0]}mm`,
    y: `${via.at[1]}mm`,
    outer_diameter: `${via.size}mm`,
    hole_diameter: `${via.drill}mm`,
    layers: via.layers
      .map(mapKicadLayerToTscircuitLayer)
      .filter((layer): layer is CJ.LayerRef => layer !== null),
  })
}

// Map KiCad layer names to CircuitJSON layer references
export function mapKicadLayerToTscircuitLayer(
  kicadLayer: string,
): CJ.LayerRef | null {
  const layerMap: { [key: string]: CJ.LayerRef } = {
    "F.Cu": "top",
    "B.Cu": "bottom",
    "F.SilkS": "top",
    "B.SilkS": "bottom",
    // Add other necessary mappings for via layers
    "In1.Cu": "inner1",
    "In2.Cu": "inner2",
    // ... add more inner layers as needed
  }
  return layerMap[kicadLayer] ?? null
}

export function mapTscircuitLayerToKicadLayer(
  tscircuitLayer: CJ.LayerRef,
): string | null {
  const layerMap: { [key: string]: string } = {
    top: "F.Cu",
    bottom: "B.Cu",
    inner1: "In1.Cu",
    inner2: "In2.Cu",
  }
  return layerMap[tscircuitLayer] ?? null
}
