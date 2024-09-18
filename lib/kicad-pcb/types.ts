type YesNoBool = "yes" | "no" | boolean

// Root export interface representing the entire KiCad Pcb
export interface KiCadPcb {
  version: number
  generator: string
  generator_version: string
  general: General
  paper: string
  layers: Layer[]
  setup: Setup
  nets: Net[]
  footprints: Footprint[]
  gr_rects: GrRect[]
  segments: Segment[]
}

// General settings of the Pcb
export interface General {
  thickness: number
  legacy_teardrops: YesNoBool
}

// Layer definition
export interface Layer {
  id: number
  name: string
  type: string
  description?: string
}

// Setup configurations
export interface Setup {
  pad_to_mask_clearance: number
  allow_soldermask_bridges_in_footprints: YesNoBool
  pcbplotparams: PcbPlotParams
}

// Pcb Plot Parameters
export interface PcbPlotParams {
  layerselection: string
  plot_on_all_layers_selection: string
  disableapertmacros: YesNoBool
  usegerberextensions: YesNoBool
  usegerberattributes: YesNoBool
  usegerberadvancedattributes: YesNoBool
  creategerberjobfile: YesNoBool
  dashed_line_dash_ratio: number
  dashed_line_gap_ratio: number
  svgprecision: number
  plotframeref: YesNoBool
  viasonmask: YesNoBool
  mode: number
  useauxorigin: YesNoBool
  hpglpennumber: number
  hpglpenspeed: number
  hpglpendiameter: number
  pdf_front_fp_property_popups: YesNoBool
  pdf_back_fp_property_popups: YesNoBool
  dxfpolygonmode: YesNoBool
  dxfimperialunits: YesNoBool
  dxfusepcbnewfont: YesNoBool
  psnegative: YesNoBool
  psa4output: YesNoBool
  plotreference: YesNoBool
  plotvalue: YesNoBool
  plotfptext: YesNoBool
  plotinvisibletext: YesNoBool
  sketchpadsonfab: YesNoBool
  subtractmaskfromsilk: YesNoBool
  outputformat: number
  mirror: YesNoBool
  drillshape: number
  scaleselection: number
  outputdirectory: string
}

// Net definition
export interface Net {
  id: number
  name: string
}

// Footprint definition
export interface Footprint {
  footprint: string
  layer: string
  uuid: string
  at: At
  descr?: string
  tags?: string
  properties?: Property[]
  path?: string
  sheetname?: string
  sheetfile?: string
  attr?: string
  fp_lines?: FpLine[]
  fp_texts?: FpText[]
  pads?: Pad[]
  model?: Model
}

// Positioning data
export interface At {
  x: number
  y: number
  rotation?: number
}

// Property within a footprint
export interface Property {
  name: string
  value: string
  at?: At
  layer?: string
  uuid?: string
  unlocked?: boolean
  hide?: boolean
  effects?: Effects
}

// Text effects
export interface Effects {
  font?: Font
}

// Font specifications
export interface Font {
  size: [number, number]
  thickness: number
}

// Footprint line element
export interface FpLine {
  start: [number, number]
  end: [number, number]
  stroke: Stroke
  layer: string
  uuid?: string
}

// Stroke style
export interface Stroke {
  width: number
  type: string
}

// Footprint text element
export interface FpText {
  type: string
  text: string
  at: At
  layer: string
  uuid?: string
  effects?: Effects
}

// Pad within a footprint
export interface Pad {
  number: string
  type: "thru_hole" | "smd"
  drill?: number
  shape: "rect" | "roundrect" | "oval" | "circle"
  at: [number, number]
  size: [number, number]
  layers: string[]
  roundrect_rratio?: number
  net?: NetReference
  pintype?: string
  uuid?: string
}

// Reference to a net
export interface NetReference {
  id: number
  name?: string
}

// 3D model information
export interface Model {
  path: string
  offset?: {
    xyz: [number, number, number]
  }
  scale?: {
    xyz: [number, number, number]
  }
  rotate?: {
    xyz: [number, number, number]
  }
}

// Graphical rectangle element
export interface GrRect {
  start: [number, number]
  end: [number, number]
  stroke: Stroke
  fill: string
  layer: string
  uuid?: string
}

// Pcb track segment
export interface Segment {
  start: [number, number]
  end: [number, number]
  width: number
  layer: string
  net: number
  uuid?: string
}
