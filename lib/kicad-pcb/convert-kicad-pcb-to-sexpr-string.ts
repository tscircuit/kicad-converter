import type {
  KiCadPcb,
  Footprint,
  Pad,
  Segment,
  Net,
  Layer,
  PcbPlotParams,
  Via,
} from "./types"

export function convertKiCadPcbToSExprString(kicadPcb: KiCadPcb): string {
  const lines: string[] = []

  lines.push("(kicad_pcb")
  lines.push(`  (version ${kicadPcb.version})`)
  lines.push(`  (generator "${kicadPcb.generator}")`)
  lines.push(`  (generator_version "${kicadPcb.generator_version}")`)

  // General
  lines.push("  (general")
  lines.push(`    (thickness ${kicadPcb.general.thickness})`)
  lines.push(
    `    (legacy_teardrops ${kicadPcb.general.legacy_teardrops ? "yes" : "no"})`,
  )
  lines.push("  )")

  lines.push(`  (paper "${kicadPcb.paper}")`)

  // Layers
  lines.push("  (layers")
  kicadPcb.layers.forEach((layer) => {
    lines.push(`    ${convertLayerToSExpr(layer)}`)
  })
  lines.push("  )")

  // Setup
  lines.push("  (setup")
  lines.push(
    `    (pad_to_mask_clearance ${kicadPcb.setup.pad_to_mask_clearance})`,
  )
  lines.push(
    `    (allow_soldermask_bridges_in_footprints ${kicadPcb.setup.allow_soldermask_bridges_in_footprints ? "yes" : "no"})`,
  )
  lines.push(`    (pcbplotparams`)
  lines.push(convertPcbPlotParamsToSExpr(kicadPcb.setup.pcbplotparams))
  lines.push("    )")
  lines.push("  )")

  // Nets
  kicadPcb.nets.forEach((net) => {
    lines.push(`  (net ${net.id} "${net.name}")`)
  })

  // Footprints
  kicadPcb.footprints.forEach((footprint) => {
    lines.push(convertFootprintToSExpr(footprint))
  })

  // Segments
  kicadPcb.segments.forEach((segment) => {
    lines.push(convertSegmentToSExpr(segment))
  })

  // Vias
  kicadPcb.vias?.forEach((via) => {
    lines.push(convertViaToSExpr(via))
  })

  lines.push(")")

  return lines.join("\n")
}

function convertLayerToSExpr(layer: Layer): string {
  return `(${layer.id} "${layer.name}" ${layer.type}${layer.description ? ` "${layer.description}"` : ""})`
}

function convertPcbPlotParamsToSExpr(params: PcbPlotParams): string {
  const lines: string[] = []
  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === "boolean") {
      lines.push(`      (${key} ${value ? "yes" : "no"})`)
    } else if (typeof value === "number") {
      lines.push(`      (${key} ${value})`)
    } else {
      lines.push(`      (${key} "${value}")`)
    }
  })
  return lines.join("\n")
}

function convertFootprintToSExpr(footprint: Footprint): string {
  const lines: string[] = []
  lines.push(`  (footprint "${footprint.footprint}"`)
  lines.push(`    (layer "${footprint.layer}")`)
  lines.push(`    (uuid ${footprint.uuid})`)
  lines.push(
    `    (at ${footprint.at.x} ${footprint.at.y}${footprint.at.rotation ? ` ${footprint.at.rotation}` : ""})`,
  )

  if (footprint.descr) lines.push(`    (descr "${footprint.descr}")`)
  if (footprint.tags) lines.push(`    (tags "${footprint.tags}")`)

  footprint.pads?.forEach((pad) => {
    lines.push(convertPadToSExpr(pad))
  })

  lines.push("  )")
  return lines.join("\n")
}

function convertPadToSExpr(pad: Pad): string {
  const lines: string[] = []
  lines.push(`    (pad "${pad.number}" ${pad.type} ${pad.shape}`)
  lines.push(`      (at ${pad.at[0]} ${pad.at[1]})`)
  lines.push(`      (size ${pad.size[0]} ${pad.size[1]})`)
  lines.push(`      (layers ${pad.layers.join(" ")})`)
  if (pad.net) {
    lines.push(`      (net ${pad.net.id} "${pad.net.name}")`)
  }
  lines.push("    )")
  return lines.join("\n")
}

function convertSegmentToSExpr(segment: Segment): string {
  return `  (segment (start ${segment.start[0]} ${segment.start[1]}) (end ${segment.end[0]} ${segment.end[1]}) (width ${segment.width}) (layer "${segment.layer}") (net ${segment.net}))`
}

function surroundWithQuotes(value: string): string {
  return `"${value}"`
}

function convertViaToSExpr(via: Via): string {
  return `  (via (at ${via.at[0]} ${via.at[1]}) (size ${via.size}) (drill ${via.drill}) (layers ${via.layers.map(surroundWithQuotes).join(" ")}) (net ${via.net})${via.uuid ? ` (uuid "${via.uuid}")` : ""})`
}
