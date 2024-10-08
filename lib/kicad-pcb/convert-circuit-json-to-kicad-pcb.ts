import * as CJ from "@tscircuit/soup"
import type {
  KiCadPcb,
  Footprint,
  Pad,
  Segment,
  Net,
  Via,
  GrLine,
  NetReference,
} from "./types"
import { transformPCBElements } from "@tscircuit/soup-util"
import { scale, compose, translate } from "transformation-matrix"
import { mapTscircuitLayerToKicadLayer } from "./convert-kicad-pcb-to-circuit-json"
import {
  ConnectivityMap,
  getFullConnectivityMapFromCircuitJson,
} from "circuit-json-to-connectivity-map"

export function convertCircuitJsonToKiCadPcb(
  circuitJson: CJ.AnyCircuitElement[],
): KiCadPcb {
  /**
   * Use this connectivity map to find the net for any id, e.g.
   * connMap.getNetConnectedToId("source_port_id") // "connectivity_net4"
   */
  const connMap = getFullConnectivityMapFromCircuitJson(circuitJson)
  circuitJson = transformPCBElements(
    JSON.parse(JSON.stringify(circuitJson)),
    // Flip the Y axis and translate to center of A4 kicad sheet
    compose(scale(1, -1), translate(148.5, -105)),
  ) as any

  const kicadPcb: KiCadPcb = {
    version: 20240108,
    generator: "tscircuit",
    generator_version: "1.0",
    general: {
      thickness: 1.6,
      legacy_teardrops: false,
    },
    paper: "A4",
    layers: [
      {
        id: 0,
        name: "F.Cu",
        type: "signal",
      },
      {
        id: 31,
        name: "B.Cu",
        type: "signal",
      },
      {
        id: 32,
        name: "B.Adhes",
        type: "user",
        description: "B.Adhesive",
      },
      {
        id: 33,
        name: "F.Adhes",
        type: "user",
        description: "F.Adhesive",
      },
      {
        id: 34,
        name: "B.Paste",
        type: "user",
      },
      {
        id: 35,
        name: "F.Paste",
        type: "user",
      },
      {
        id: 36,
        name: "B.SilkS",
        type: "user",
        description: "B.Silkscreen",
      },
      {
        id: 37,
        name: "F.SilkS",
        type: "user",
        description: "F.Silkscreen",
      },
      {
        id: 38,
        name: "B.Mask",
        type: "user",
      },
      {
        id: 39,
        name: "F.Mask",
        type: "user",
      },
      {
        id: 40,
        name: "Dwgs.User",
        type: "user",
        description: "User.Drawings",
      },
      {
        id: 41,
        name: "Cmts.User",
        type: "user",
        description: "User.Comments",
      },
      {
        id: 42,
        name: "Eco1.User",
        type: "user",
        description: "User.Eco1",
      },
      {
        id: 43,
        name: "Eco2.User",
        type: "user",
        description: "User.Eco2",
      },
      {
        id: 44,
        name: "Edge.Cuts",
        type: "user",
      },
      {
        id: 45,
        name: "Margin",
        type: "user",
      },
      {
        id: 46,
        name: "B.CrtYd",
        type: "user",
        description: "B.Courtyard",
      },
      {
        id: 47,
        name: "F.CrtYd",
        type: "user",
        description: "F.Courtyard",
      },
      {
        id: 48,
        name: "B.Fab",
        type: "user",
      },
      {
        id: 49,
        name: "F.Fab",
        type: "user",
      },
      {
        id: 50,
        name: "User.1",
        type: "user",
      },
      {
        id: 51,
        name: "User.2",
        type: "user",
      },
      {
        id: 52,
        name: "User.3",
        type: "user",
      },
      {
        id: 53,
        name: "User.4",
        type: "user",
      },
      {
        id: 54,
        name: "User.5",
        type: "user",
      },
      {
        id: 55,
        name: "User.6",
        type: "user",
      },
      {
        id: 56,
        name: "User.7",
        type: "user",
      },
      {
        id: 57,
        name: "User.8",
        type: "user",
      },
      {
        id: 58,
        name: "User.9",
        type: "user",
      },
    ],
    setup: {
      pad_to_mask_clearance: 0,
      allow_soldermask_bridges_in_footprints: false,
      pcbplotparams: {
        layerselection: "0x00010fc_ffffffff",
        plot_on_all_layers_selection: "0x0000000_00000000",
        disableapertmacros: false,
        usegerberextensions: false,
        usegerberattributes: true,
        usegerberadvancedattributes: true,
        creategerberjobfile: true,
        svgprecision: 4,
        // @ts-expect-error
        excludeedgelayer: true,
        plotframeref: false,
        viasonmask: false,
        mode: 1,
        useauxorigin: false,
        hpglpennumber: 1,
        hpglpenspeed: 20,
        hpglpendiameter: 15,
        dxfpolygonmode: true,
        dxfimperialunits: true,
        dxfusepcbnewfont: true,
        psnegative: false,
        psa4output: false,
        plotreference: true,
        plotvalue: true,
        plotinvisibletext: false,
        sketchpadsonfab: false,
        subtractmaskfromsilk: false,
        outputformat: 1,
        mirror: false,
        drillshape: 1,
        scaleselection: 1,
        outputdirectory: "",
      },
    },
    nets: [],
    footprints: [],
    segments: [],
    vias: [],
  }

  circuitJson.forEach((element) => {
    switch (element.type) {
      case "pcb_component":
        kicadPcb.footprints.push(
          convertPcbComponentToFootprint(element, circuitJson, connMap),
        )
        break
      case "pcb_trace":
        kicadPcb.segments.push(...convertPcbTraceToSegments(element, connMap))
        break
      case "pcb_via":
        kicadPcb.vias.push(convertPcbViaToVia(element as CJ.PCBVia, connMap))
        break
      case "pcb_hole":
        kicadPcb.footprints.push(
          convertPcbHoleToFootprint(element as CJ.PCBHole),
        )
        break
      case "pcb_plated_hole":
        kicadPcb.footprints.push(
          convertPcbPlatedHoleToFootprint(element as CJ.PCBPlatedHole, connMap),
        )
        break
      case "pcb_board":
        kicadPcb.gr_lines = convertPcbBoardToEdgeCuts(element as CJ.PCBBoard)
        break
    }
  })

  // Add nets to KiCad PCB
  for (const [netId, connections] of Object.entries(connMap.netMap)) {
    kicadPcb.nets.push({
      id: netIdToNumber(netId),
      name: netId,
    })
  }

  return kicadPcb
}

function convertPcbBoardToEdgeCuts(board: CJ.PCBBoard): GrLine[] {
  const edgeCuts: GrLine[] = []
  const outline = board.outline || [
    {
      x: board.center.x - board.width / 2,
      y: board.center.y + board.height / 2,
    },
    {
      x: board.center.x + board.width / 2,
      y: board.center.y + board.height / 2,
    },
    {
      x: board.center.x + board.width / 2,
      y: board.center.y - board.height / 2,
    },
    {
      x: board.center.x - board.width / 2,
      y: board.center.y - board.height / 2,
    },
  ]

  for (let i = 0; i < outline.length; i++) {
    const start = outline[i]
    const end = outline[(i + 1) % outline.length]
    edgeCuts.push({
      start: [start.x, start.y],
      end: [end.x, end.y],
      layer: "Edge.Cuts",
      width: 0.1,
    })
  }

  return edgeCuts
}

function convertPcbViaToVia(via: CJ.PCBVia, connMap: ConnectivityMap): Via {
  return {
    at: [via.x, via.y],
    size: via.outer_diameter,
    drill: via.hole_diameter,
    layers: via.layers.map((l) => mapTscircuitLayerToKicadLayer(l)!),
    // TODO: Waiting on pcb_trace_id being available in Circuit JSON before we
    // can add nets for vias
    net: 0,
    uuid: `via_${via.x}_${via.y}`,
  }
}

function convertPcbHoleToFootprint(hole: CJ.PCBHole): Footprint {
  // @ts-ignore
  if (hole.hole_shape === "round") hole.hole_shape = "circle"

  if (hole.hole_shape === "circle") {
    return {
      footprint: "MountingHole",
      layer: "F.Cu",
      uuid: hole.pcb_hole_id || generateUniqueId(),
      at: { x: hole.x, y: hole.y },
      pads: [
        {
          type: "np_thru_hole",
          shape: "circle",
          at: [0, 0],
          size: [hole.hole_diameter, hole.hole_diameter],
          drill: hole.hole_diameter,
          layers: ["*.Cu", "*.Mask"],
          number: "",
        },
      ],
    }
  } else if (hole.hole_shape === "oval") {
    return {
      footprint: "MountingHole",
      layer: "F.Cu",
      uuid: hole.pcb_hole_id || generateUniqueId(),
      at: { x: hole.x, y: hole.y },
      pads: [
        {
          type: "np_thru_hole",
          shape: "circle",
          at: [0, 0],
          size: [hole.hole_width, hole.hole_height],
          drill: hole.hole_width,
          layers: ["*.Cu", "*.Mask"],
          number: "",
        },
      ],
    }
  } else if (hole.hole_shape === "square") {
    return {
      footprint: "MountingHole",
      layer: "F.Cu",
      uuid: hole.pcb_hole_id || generateUniqueId(),
      at: { x: hole.x, y: hole.y },
      pads: [
        {
          type: "np_thru_hole",
          shape: "rect",
          at: [0, 0],
          size: [hole.hole_diameter, hole.hole_diameter],
          drill: hole.hole_diameter,
          layers: ["*.Cu", "*.Mask"],
          number: "",
        },
      ],
    }
  }
  throw new Error(`Unknown hole shape: ${hole.hole_shape}`)
}

function convertPcbPlatedHoleToFootprint(
  platedHole: CJ.PCBPlatedHole,
  connMap: ConnectivityMap,
): Footprint {
  const number = platedHole.port_hints?.find((ph) => ph.match(/^\d+$/)) || ""
  if (platedHole.shape === "circle") {
    return {
      footprint: "PlatedHole",
      layer: "F.Cu", // Assuming top layer, adjust if needed
      uuid: platedHole.pcb_plated_hole_id || generateUniqueId(),
      at: { x: platedHole.x, y: platedHole.y },
      pads: [
        {
          type: "thru_hole",
          shape: platedHole.shape === "circle" ? "circle" : "rect",
          at: [0, 0],
          size: [platedHole.outer_diameter, platedHole.outer_diameter],
          drill: platedHole.hole_diameter,
          layers: platedHole.layers.map(
            (l) => mapTscircuitLayerToKicadLayer(l)!,
          ),
          net: netIdToNetRef(
            connMap.getNetConnectedToId(platedHole.pcb_plated_hole_id!)!,
          ),
          number,
        },
      ],
    }
  } else if (platedHole.shape === "oval" || platedHole.shape === "pill") {
    // TODO handle pill shape properly
    return {
      footprint: "PlatedHole",
      layer: "F.Cu", // Assuming top layer, adjust if needed
      uuid: platedHole.pcb_plated_hole_id || generateUniqueId(),
      at: { x: platedHole.x, y: platedHole.y },
      pads: [
        {
          type: "thru_hole",
          shape: "oval",
          at: [0, 0],
          size: [platedHole.outer_width, platedHole.outer_height],
          drill: platedHole.hole_width,
          layers: platedHole.layers.map(
            (l) => mapTscircuitLayerToKicadLayer(l)!,
          ),
          net: netIdToNetRef(
            connMap.getNetConnectedToId(platedHole.pcb_plated_hole_id!)!,
          ),
          number,
        },
      ],
    }
  }
  throw new Error(`Unknown plated hole shape: ${platedHole.shape}`)
}

function generateUniqueId(): string {
  return "id_" + Math.random().toString(36).substr(2, 9)
}

function convertPcbComponentToFootprint(
  component: CJ.PcbComponent,
  allElements: CJ.AnyCircuitElement[],
  connMap: ConnectivityMap,
): Footprint {
  const footprint: Footprint = {
    footprint: component.source_component_id,
    layer: component.layer === "top" ? "F.Cu" : "B.Cu",
    uuid: component.pcb_component_id,
    at: {
      x: component.center.x,
      y: component.center.y,
      // We don't rotate because Circuit JSON coordinates are pre-rotated
      // rotation: component.rotation ? parseFloat(component.rotation) : 0,
    },
    pads: [],
  }

  for (const elm of allElements) {
    if (
      elm.type === "pcb_smtpad" &&
      elm.pcb_component_id === component.pcb_component_id
    ) {
      const kicadPad = convertPcbSmtPadToPad(elm, component, connMap)
      if (kicadPad) footprint.pads?.push(kicadPad)
    }
  }

  return footprint
}

function mapToKicadLayer(layer: CJ.LayerRef): string | undefined {
  const CJ_LAYER_TO_KICAD_LAYER: Partial<Record<CJ.LayerRef, string>> = {
    top: "F.Cu",
    bottom: "B.Cu",
  }
  return CJ_LAYER_TO_KICAD_LAYER[layer]
}

function convertPcbSmtPadToPad(
  pad: CJ.PCBSMTPad,
  component: CJ.PcbComponent,
  connMap: ConnectivityMap,
): Pad | null {
  if (pad.shape === "rect") {
    return {
      number: pad.port_hints?.find((ph) => ph.match(/^\d+$/)) || "",
      type: "smd",
      net: netIdToNetRef(connMap.getNetConnectedToId(pad.pcb_smtpad_id)!),
      shape: "roundrect",
      at: [pad.x - component.center.x, pad.y - component.center.y],
      size: [pad.width, pad.height],
      layers: [mapToKicadLayer(pad.layer)].filter(Boolean) as string[],
    }
  }
  return null
}

function netIdToNetRef(netId: string): NetReference {
  return {
    id: netIdToNumber(netId),
    name: netId,
  }
}

function convertPcbTraceToSegments(
  trace: CJ.PCBTrace,
  connMap: ConnectivityMap,
): Segment[] {
  const segments: Segment[] = []
  const netId = netIdToNumber(
    connMap.getNetConnectedToId(trace.source_trace_id!)!,
  )

  for (let i = 0; i < trace.route.length - 1; i++) {
    const start = trace.route[i]
    const end = trace.route[i + 1]
    segments.push({
      start: [start.x, start.y],
      end: [end.x, end.y],
      width:
        // @ts-expect-error
        trace.route_thickness_mode === "constant" ? trace.route[0].width : 0.2, // Default width if not constant
      // @ts-expect-error
      layer: start.layer === "top" ? "F.Cu" : "B.Cu",
      net: netId,
    })
  }

  return segments
}

function netIdToNumber(netId: string): number {
  if (!netId) return 0
  if (netId.startsWith("connectivity_net")) {
    return parseInt(netId.replace("connectivity_net", ""))
  }
  return 0
}
