import type { SExpr } from "./../common/parse-sexpr"
import type {
  At,
  Effects,
  Font,
  Footprint,
  FpLine,
  FpText,
  General,
  GrRect,
  KiCadPcb,
  Layer,
  Model,
  Net,
  Pad,
  PcbPlotParams,
  Property,
  Segment,
  Setup,
  Stroke,
  Via,
} from "./types"
import { KiCadPcbSchema } from "./zod"

// Now, we'll write functions to convert the parsed s-expressions into our TypeScript types.

export function parseKiCadPcb(sexpr: SExpr): KiCadPcb {
  if (!Array.isArray(sexpr)) {
    throw new Error("Invalid KiCad Pcb format")
  }

  // The root should start with 'kicad_pcb'
  if (sexpr[0] !== "kicad_pcb") {
    throw new Error("Not a KiCad Pcb file")
  }

  const pcb: KiCadPcb = {
    version: 0,
    generator: "",
    generator_version: "",
    general: { thickness: 0, legacy_teardrops: "no" },
    paper: "",
    layers: [],
    setup: {
      pad_to_mask_clearance: 0,
      allow_soldermask_bridges_in_footprints: "no",
      pcbplotparams: {} as PcbPlotParams,
    },
    nets: [],
    footprints: [],
    gr_rects: [],
    segments: [],
    vias: [],
  }

  // Process each element in the root s-expression
  for (let i = 1; i < sexpr.length; i++) {
    const elem = sexpr[i]
    if (!Array.isArray(elem)) continue

    const key = elem[0]
    switch (key) {
      case "version":
        pcb.version = Number(elem[1])
        break
      case "generator":
        pcb.generator = elem[1] as string
        break
      case "generator_version":
        pcb.generator_version = elem[1] as string
        break
      case "general":
        pcb.general = parseGeneral(elem)
        break
      case "paper":
        pcb.paper = elem[1] as string
        break
      case "layers":
        pcb.layers = parseLayers(elem)
        break
      case "setup":
        pcb.setup = parseSetup(elem)
        break
      case "net":
        pcb.nets.push(parseNet(elem))
        break
      case "footprint":
        pcb.footprints.push(parseFootprint(elem))
        break
      case "gr_rect":
        pcb.gr_rects.push(parseGrRect(elem))
        break
      case "segment":
        pcb.segments.push(parseSegment(elem))
        break
      case "via":
        pcb.vias.push(parseVia(elem))
        break
      default:
        // Handle other elements as needed
        break
    }
  }

  // @ts-ignore
  return KiCadPcbSchema.parse(pcb)
}

// Function to parse the 'general' section
function parseGeneral(sexpr: SExpr): General {
  const general: General = { thickness: 0, legacy_teardrops: "no" }

  for (let i = 1; i < sexpr.length; i++) {
    const elem = sexpr[i]
    if (!Array.isArray(elem)) continue

    const key = elem[0]
    switch (key) {
      case "thickness":
        general.thickness = Number(elem[1])
        break
      case "legacy_teardrops":
        general.legacy_teardrops = elem[1] as "no" | "yes"
        break
      default:
        break
    }
  }

  return general
}

// Function to parse the 'layers' section
function parseLayers(sexpr: SExpr): Layer[] {
  const layers: Layer[] = []

  for (let i = 1; i < sexpr.length; i++) {
    const elem = sexpr[i]
    if (!Array.isArray(elem)) continue

    const id = Number(elem[0])
    const name = elem[1] as string
    const type = elem[2] as string
    const description = elem[3] as string | undefined

    layers.push({ id, name, type, description })
  }

  return layers
}

// Function to parse the 'setup' section
function parseSetup(sexpr: SExpr): Setup {
  const setup: Setup = {
    pad_to_mask_clearance: 0,
    allow_soldermask_bridges_in_footprints: "no",
    pcbplotparams: {} as PcbPlotParams,
  }

  for (let i = 1; i < sexpr.length; i++) {
    const elem = sexpr[i]
    if (!Array.isArray(elem)) continue

    const key = elem[0]
    if (key === "pad_to_mask_clearance") {
      setup.pad_to_mask_clearance = Number(elem[1])
    } else if (key === "allow_soldermask_bridges_in_footprints") {
      setup.allow_soldermask_bridges_in_footprints = elem[1] as "no" | "yes"
    } else if (key === "pcbplotparams") {
      setup.pcbplotparams = parsePcbPlotParams(elem)
    }
  }

  return setup
}

// Function to parse 'pcbplotparams'
function parsePcbPlotParams(sexpr: SExpr): PcbPlotParams {
  const params: any = {}

  for (let i = 1; i < sexpr.length; i++) {
    const elem = sexpr[i]
    if (!Array.isArray(elem)) continue

    const key = elem[0]
    const value = elem[1]

    // Determine the type of value
    if (value === "yes" || value === "no") {
      // @ts-ignore
      params[key] = value
      // @ts-ignore
    } else if (/^-?\d+\.?\d*$/.test(value)) {
      // @ts-ignore
      params[key] = Number(value)
    } else {
      // @ts-ignore
      params[key] = value
    }
  }

  return params as PcbPlotParams
}

// Function to parse a 'net' element
function parseNet(sexpr: SExpr): Net {
  const id = Number(sexpr[1])
  const name = sexpr[2] as string

  return { id, name }
}

// Function to parse a 'footprint' element
function parseFootprint(sexpr: SExpr): Footprint {
  const footprint: Footprint = {
    footprint: "",
    layer: "",
    uuid: "",
    at: { x: 0, y: 0 },
    properties: [],
    fp_lines: [],
    fp_texts: [],
    pads: [],
  }

  footprint.footprint = sexpr[1] as string

  for (let i = 2; i < sexpr.length; i++) {
    const elem = sexpr[i]
    if (!Array.isArray(elem)) continue

    const key = elem[0]
    switch (key) {
      case "layer":
        footprint.layer = elem[1] as string
        break
      case "uuid":
        footprint.uuid = elem[1] as string
        break
      case "at":
        footprint.at = parseAt(elem)
        break
      case "descr":
        footprint.descr = elem[1] as string
        break
      case "tags":
        footprint.tags = elem[1] as string
        break
      case "property":
        footprint.properties!.push(parseProperty(elem))
        break
      case "fp_line":
        footprint.fp_lines!.push(parseFpLine(elem))
        break
      case "fp_text":
        footprint.fp_texts!.push(parseFpText(elem))
        break
      case "pad":
        footprint.pads!.push(parsePad(elem))
        break
      case "model":
        footprint.model = parseModel(elem)
        break
      case "path":
        footprint.path = elem[1] as string
        break
      case "sheetname":
        footprint.sheetname = elem[1] as string
        break
      case "sheetfile":
        footprint.sheetfile = elem[1] as string
        break
      case "attr":
        footprint.attr = elem[1] as string
        break
      default:
        console.log(`Warning: Unhandled key in footprint: ${key}`)
        break
    }
  }

  return footprint
}

// Function to parse 'at' elements
function parseAt(sexpr: SExpr): At {
  const x = Number(sexpr[1])
  const y = Number(sexpr[2])
  const rotation = sexpr.length > 3 ? Number(sexpr[3]) : undefined

  return { x, y, rotation }
}

// Function to parse 'property' elements
function parseProperty(sexpr: SExpr): Property {
  const name = sexpr[1] as string
  const value = sexpr[2] as string
  const property: Property = { name, value }

  for (let i = 3; i < sexpr.length; i++) {
    const elem = sexpr[i]
    if (!Array.isArray(elem)) continue

    const key = elem[0]
    switch (key) {
      case "at":
        property.at = parseAt(elem)
        break
      case "layer":
        property.layer = elem[1] as string
        break
      case "uuid":
        property.uuid = elem[1] as string
        break
      case "unlocked":
        property.unlocked = elem[1] === "yes"
        break
      case "hide":
        property.hide = elem[1] === "yes"
        break
      case "effects":
        property.effects = parseEffects(elem)
        break
      default:
        break
    }
  }

  return property
}

// Function to parse 'effects' elements
function parseEffects(sexpr: SExpr): Effects {
  const effects: Effects = {}

  for (let i = 1; i < sexpr.length; i++) {
    const elem = sexpr[i]
    if (!Array.isArray(elem)) continue

    const key = elem[0]
    if (key === "font") {
      effects.font = parseFont(elem)
    }
  }

  return effects
}

// Function to parse 'font' elements
function parseFont(sexpr: SExpr): Font {
  const font: Font = { size: [0, 0], thickness: 0 }

  for (let i = 1; i < sexpr.length; i++) {
    const elem = sexpr[i]
    if (!Array.isArray(elem)) continue

    const key = elem[0]
    if (key === "size") {
      font.size = [Number(elem[1]), Number(elem[2])]
    } else if (key === "thickness") {
      font.thickness = Number(elem[1])
    }
  }

  return font
}

// Function to parse 'fp_line' elements
function parseFpLine(sexpr: SExpr): FpLine {
  const fp_line: FpLine = {
    start: [0, 0],
    end: [0, 0],
    stroke: { width: 0, type: "" },
    layer: "",
  }

  for (let i = 1; i < sexpr.length; i++) {
    const elem = sexpr[i]
    if (!Array.isArray(elem)) continue

    const key = elem[0]
    switch (key) {
      case "start":
        fp_line.start = [Number(elem[1]), Number(elem[2])]
        break
      case "end":
        fp_line.end = [Number(elem[1]), Number(elem[2])]
        break
      case "stroke":
        fp_line.stroke = parseStroke(elem)
        break
      case "layer":
        fp_line.layer = elem[1] as string
        break
      case "uuid":
        fp_line.uuid = elem[1] as string
        break
      default:
        break
    }
  }

  return fp_line
}

// Function to parse 'stroke' elements
function parseStroke(sexpr: SExpr): Stroke {
  const stroke: Stroke = { width: 0, type: "" }

  for (let i = 1; i < sexpr.length; i++) {
    const elem = sexpr[i]
    if (!Array.isArray(elem)) continue

    const key = elem[0]
    if (key === "width") {
      stroke.width = Number(elem[1])
    } else if (key === "type") {
      stroke.type = elem[1] as string
    }
  }

  return stroke
}

// Function to parse 'fp_text' elements
function parseFpText(sexpr: SExpr): FpText {
  const fp_text: FpText = { type: "", text: "", at: { x: 0, y: 0 }, layer: "" }

  fp_text.type = sexpr[1] as string
  fp_text.text = sexpr[2] as string

  for (let i = 3; i < sexpr.length; i++) {
    const elem = sexpr[i]
    if (!Array.isArray(elem)) continue

    const key = elem[0]
    switch (key) {
      case "at":
        fp_text.at = parseAt(elem)
        break
      case "layer":
        fp_text.layer = elem[1] as string
        break
      case "uuid":
        fp_text.uuid = elem[1] as string
        break
      case "effects":
        fp_text.effects = parseEffects(elem)
        break
      default:
        break
    }
  }

  return fp_text
}

// Function to parse 'pad' elements
function parsePad(sexpr: SExpr): Pad {
  const pad: Pad = {
    number: "",
    type: "" as any,
    // @ts-ignore
    shape: "",
    at: [0, 0],
    size: [0, 0],
    layers: [],
  }

  pad.number = sexpr[1] as string
  pad.type = sexpr[2] as "thru_hole" | "smd"
  // @ts-ignore
  pad.shape = sexpr[3] as string

  for (let i = 4; i < sexpr.length; i++) {
    const elem = sexpr[i]
    if (!Array.isArray(elem)) continue

    const key = elem[0]
    switch (key) {
      case "drill":
        pad.drill = Number(elem[1])
        break
      case "at":
        pad.at = [Number(elem[1]), Number(elem[2])]
        break
      case "size":
        pad.size = [Number(elem[1]), Number(elem[2])]
        break
      case "layers":
        pad.layers = elem.slice(1) as string[]
        break
      case "roundrect_rratio":
        pad.roundrect_rratio = Number(elem[1])
        break
      case "net":
        pad.net = { id: Number(elem[1]), name: elem[2] as string }
        break
      case "pintype":
        pad.pintype = elem[1] as string
        break
      case "uuid":
        pad.uuid = elem[1] as string
        break
      default:
        break
    }
  }

  return pad
}

// Function to parse 'model' elements
function parseModel(sexpr: SExpr): Model {
  const model: Model = { path: "" }
  model.path = sexpr[1] as string

  for (let i = 2; i < sexpr.length; i++) {
    const elem = sexpr[i]
    if (!Array.isArray(elem)) continue

    const key = elem[0]
    switch (key) {
      case "offset":
        model.offset = parseXYZ(elem)
        break
      case "scale":
        model.scale = parseXYZ(elem)
        break
      case "rotate":
        model.rotate = parseXYZ(elem)
        break
      default:
        break
    }
  }

  return model
}

// Function to parse 'xyz' elements
function parseXYZ(sexpr: SExpr): { xyz: [number, number, number] } {
  // @ts-ignore
  const xyzElem = sexpr.find((e) => Array.isArray(e) && e[0] === "xyz") as
    | SExpr
    | undefined
  if (xyzElem && Array.isArray(xyzElem)) {
    return {
      xyz: [Number(xyzElem[1]), Number(xyzElem[2]), Number(xyzElem[3])],
    }
  }
  return { xyz: [0, 0, 0] }
}

// Function to parse 'gr_rect' elements
function parseGrRect(sexpr: SExpr): GrRect {
  const gr_rect: GrRect = {
    start: [0, 0],
    end: [0, 0],
    stroke: { width: 0, type: "" },
    fill: "",
    layer: "",
  }

  for (let i = 1; i < sexpr.length; i++) {
    const elem = sexpr[i]
    if (!Array.isArray(elem)) continue

    const key = elem[0]
    switch (key) {
      case "start":
        gr_rect.start = [Number(elem[1]), Number(elem[2])]
        break
      case "end":
        gr_rect.end = [Number(elem[1]), Number(elem[2])]
        break
      case "stroke":
        gr_rect.stroke = parseStroke(elem)
        break
      case "fill":
        gr_rect.fill = elem[1] as string
        break
      case "layer":
        gr_rect.layer = elem[1] as string
        break
      case "uuid":
        gr_rect.uuid = elem[1] as string
        break
      default:
        break
    }
  }

  return gr_rect
}

// Function to parse 'segment' elements
function parseSegment(sexpr: SExpr): Segment {
  const segment: Segment = {
    start: [0, 0],
    end: [0, 0],
    width: 0,
    layer: "",
    net: 0,
  }

  for (let i = 1; i < sexpr.length; i++) {
    const elem = sexpr[i]
    if (!Array.isArray(elem)) continue

    const key = elem[0]
    switch (key) {
      case "start":
        segment.start = [Number(elem[1]), Number(elem[2])]
        break
      case "end":
        segment.end = [Number(elem[1]), Number(elem[2])]
        break
      case "width":
        segment.width = Number(elem[1])
        break
      case "layer":
        segment.layer = elem[1] as string
        break
      case "net":
        segment.net = Number(elem[1])
        break
      case "uuid":
        segment.uuid = elem[1] as string
        break
      default:
        break
    }
  }

  return segment
}

// Function to parse 'via' elements
function parseVia(sexpr: SExpr): Via {
  const via: Via = {
    at: [0, 0],
    size: 0,
    drill: 0,
    layers: [],
    net: 0,
    uuid: "",
  }

  for (let i = 1; i < sexpr.length; i++) {
    const elem = sexpr[i]
    if (!Array.isArray(elem)) continue

    const key = elem[0]
    switch (key) {
      case "at":
        via.at = [Number(elem[1]), Number(elem[2])]
        break
      case "size":
        via.size = Number(elem[1])
        break
      case "drill":
        via.drill = Number(elem[1])
        break
      case "layers":
        via.layers = elem.slice(1) as string[]
        break
      case "net":
        via.net = Number(elem[1])
        break
      case "uuid":
        via.uuid = elem[1] as string
        break
      default:
        // Handle other properties if needed
        break
    }
  }

  return via
}
