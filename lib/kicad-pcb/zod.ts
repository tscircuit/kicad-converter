import { z } from "zod"

export const yesnobool = z
  .union([z.literal("yes"), z.literal("no"), z.boolean()])
  .transform((v) => v === "yes" || v === true)

// General settings of the PCB
export const GeneralSchema = z.object({
  thickness: z.number(),
  legacy_teardrops: z.enum(["no", "yes"]),
})
export type ZodGeneral = z.infer<typeof GeneralSchema>

// Layer definition
export const LayerSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.string(),
  description: z.string().optional(),
})
export type ZodLayer = z.infer<typeof LayerSchema>

// PCB Plot Parameters
export const PcbPlotParamsSchema = z.object({
  layerselection: z.string(),
  plot_on_all_layers_selection: z.string(),
  disableapertmacros: yesnobool,
  usegerberextensions: yesnobool,
  usegerberattributes: yesnobool,
  usegerberadvancedattributes: yesnobool,
  creategerberjobfile: yesnobool,
  dashed_line_dash_ratio: z.number(),
  dashed_line_gap_ratio: z.number(),
  svgprecision: z.number(),
  plotframeref: yesnobool,
  viasonmask: yesnobool,
  mode: z.number(),
  useauxorigin: yesnobool,
  hpglpennumber: z.number(),
  hpglpenspeed: z.number(),
  hpglpendiameter: z.number(),
  pdf_front_fp_property_popups: yesnobool,
  pdf_back_fp_property_popups: yesnobool,
  dxfpolygonmode: yesnobool,
  dxfimperialunits: yesnobool,
  dxfusepcbnewfont: yesnobool,
  psnegative: yesnobool,
  psa4output: yesnobool,
  plotreference: yesnobool,
  plotvalue: yesnobool,
  plotfptext: yesnobool,
  plotinvisibletext: yesnobool,
  sketchpadsonfab: yesnobool,
  subtractmaskfromsilk: yesnobool,
  outputformat: z.number(),
  mirror: yesnobool,
  drillshape: z.number(),
  scaleselection: z.number(),
  outputdirectory: z.string(),
})
export type ZodPcbPlotParams = z.infer<typeof PcbPlotParamsSchema>

// Setup configurations
export const SetupSchema = z.object({
  pad_to_mask_clearance: z.number(),
  allow_soldermask_bridges_in_footprints: yesnobool,
  pcbplotparams: PcbPlotParamsSchema,
})
export type ZodSetup = z.infer<typeof SetupSchema>

// Net definition
export const NetSchema = z.object({
  id: z.number(),
  name: z.string(),
})
export type ZodNet = z.infer<typeof NetSchema>

// Positioning data
export const AtSchema = z.object({
  x: z.number(),
  y: z.number(),
  rotation: z.number().optional(),
})
export type ZodAt = z.infer<typeof AtSchema>

// Font specifications
export const FontSchema = z.object({
  size: z.tuple([z.number(), z.number()]),
  thickness: z.number(),
})
export type ZodFont = z.infer<typeof FontSchema>

// Text effects
export const EffectsSchema = z.object({
  font: FontSchema.optional(),
})
export type ZodEffects = z.infer<typeof EffectsSchema>

// Property within a footprint
export const PropertySchema = z.object({
  name: z.string(),
  value: z.string(),
  at: AtSchema.optional(),
  layer: z.string().optional(),
  uuid: z.string().optional(),
  unlocked: z.boolean().optional(),
  hide: z.boolean().optional(),
  effects: EffectsSchema.optional(),
})
export type ZodProperty = z.infer<typeof PropertySchema>

// Stroke style
export const StrokeSchema = z.object({
  width: z.number(),
  type: z.string(),
})
export type ZodStroke = z.infer<typeof StrokeSchema>

// Footprint line element
export const FpLineSchema = z.object({
  start: z.tuple([z.number(), z.number()]),
  end: z.tuple([z.number(), z.number()]),
  stroke: StrokeSchema,
  layer: z.string(),
  uuid: z.string().optional(),
})
export type ZodFpLine = z.infer<typeof FpLineSchema>

// Footprint text element
export const FpTextSchema = z.object({
  type: z.string(),
  text: z.string(),
  at: AtSchema,
  layer: z.string(),
  uuid: z.string().optional(),
  effects: EffectsSchema.optional(),
})
export type ZodFpText = z.infer<typeof FpTextSchema>

// Reference to a net
export const NetReferenceSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
})
export type ZodNetReference = z.infer<typeof NetReferenceSchema>

// Pad within a footprint
export const PadSchema = z.object({
  number: z.string(),
  type: z.string(),
  shape: z.string(),
  at: z.tuple([z.number(), z.number()]),
  size: z.tuple([z.number(), z.number()]),
  layers: z.array(z.string()),
  roundrect_rratio: z.number().optional(),
  net: NetReferenceSchema.optional(),
  pintype: z.string().optional(),
  uuid: z.string().optional(),
})
export type ZodPad = z.infer<typeof PadSchema>

// 3D model information
export const ModelSchema = z.object({
  path: z.string(),
  offset: z
    .object({
      xyz: z.tuple([z.number(), z.number(), z.number()]),
    })
    .optional(),
  scale: z
    .object({
      xyz: z.tuple([z.number(), z.number(), z.number()]),
    })
    .optional(),
  rotate: z
    .object({
      xyz: z.tuple([z.number(), z.number(), z.number()]),
    })
    .optional(),
})
export type ZodModel = z.infer<typeof ModelSchema>

// Footprint definition
export const FootprintSchema = z.object({
  footprint: z.string(),
  layer: z.string(),
  uuid: z.string(),
  at: AtSchema,
  descr: z.string().optional(),
  tags: z.string().optional(),
  properties: z.array(PropertySchema).optional(),
  path: z.string().optional(),
  sheetname: z.string().optional(),
  sheetfile: z.string().optional(),
  attr: z.string().optional(),
  fp_lines: z.array(FpLineSchema).optional(),
  fp_texts: z.array(FpTextSchema).optional(),
  pads: z.array(PadSchema).optional(),
  model: ModelSchema.optional(),
})
export type ZodFootprint = z.infer<typeof FootprintSchema>

// Graphical rectangle element
export const GrRectSchema = z.object({
  start: z.tuple([z.number(), z.number()]),
  end: z.tuple([z.number(), z.number()]),
  stroke: StrokeSchema,
  fill: z.string(),
  layer: z.string(),
  uuid: z.string().optional(),
})
export type ZodGrRect = z.infer<typeof GrRectSchema>

// PCB track segment
export const SegmentSchema = z.object({
  start: z.tuple([z.number(), z.number()]),
  end: z.tuple([z.number(), z.number()]),
  width: z.number(),
  layer: z.string(),
  net: z.number(),
  uuid: z.string().optional(),
})
export type ZodSegment = z.infer<typeof SegmentSchema>

// Root schema representing the entire KiCad PCB
export const KiCadPcbSchema = z.object({
  version: z.number(),
  generator: z.string(),
  generator_version: z.string(),
  general: GeneralSchema,
  paper: z.string(),
  layers: z.array(LayerSchema),
  setup: SetupSchema,
  nets: z.array(NetSchema),
  footprints: z.array(FootprintSchema),
  gr_rects: z.array(GrRectSchema),
  segments: z.array(SegmentSchema),
})
export type ZodKiCadPcb = z.infer<typeof KiCadPcbSchema>
