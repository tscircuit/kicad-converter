import { z } from "zod"

// Define YesNo enum
const YesNo = z.enum(["yes", "no"])

// Point schema
const PointSchema = z.object({
  x: z.number(),
  y: z.number(),
})

// At schema
const AtSchema = z.object({
  x: z.number(),
  y: z.number(),
  rotation: z.number().optional(),
})

// Font schema
const FontSchema = z.object({
  size: z.tuple([z.number(), z.number()]),
})

// Effects schema
const EffectsSchema = z.object({
  font: FontSchema.optional(),
  justify: z.string().optional(),
  hide: z.boolean().optional(),
})

// PinName and PinNumber schemas
const PinNameSchema = z.object({
  name: z.string(),
  effects: EffectsSchema.optional(),
})

const PinNumberSchema = z.object({
  number: z.string(),
  effects: EffectsSchema.optional(),
})

// Stroke schema
const StrokeSchema = z.object({
  width: z.number(),
  type: z.string().optional(),
})

// Fill schema
const FillSchema = z.object({
  type: z.string(),
})

// Polyline schema
const PolylineSchema = z.object({
  pts: z.array(PointSchema),
  stroke: StrokeSchema,
  fill: FillSchema,
})

// Rectangle schema
const RectangleSchema = z.object({
  start: PointSchema,
  end: PointSchema,
  stroke: StrokeSchema,
  fill: FillSchema,
})

// Pin schema
const PinSchema = z.object({
  type: z.string(),
  shape: z.string(),
  at: AtSchema,
  length: z.number(),
  name: PinNameSchema,
  number: PinNumberSchema,
})

// SubSymbol schema
const SubSymbolSchema = z.object({
  name: z.string(),
  polylines: z.array(PolylineSchema).optional(),
  rectangles: z.array(RectangleSchema).optional(),
  pins: z.array(PinSchema).optional(),
})

// Property schema
const PropertySchema = z.object({
  name: z.string(),
  value: z.string(),
  at: AtSchema.optional(),
  effects: EffectsSchema.optional(),
})

// PinNumbers schema
const PinNumbersSchema = z.object({
  hide: z.boolean().optional(),
})

// PinNames schema
const PinNamesSchema = z.object({
  offset: z.number(),
})

// SymbolDefinition schema
const SymbolDefinitionSchema = z.object({
  name: z.string(),
  pin_numbers: PinNumbersSchema.optional(),
  pin_names: PinNamesSchema.optional(),
  exclude_from_sim: YesNo.optional(),
  in_bom: YesNo.optional(),
  on_board: YesNo.optional(),
  properties: z.array(PropertySchema).optional(),
  symbols: z.array(SubSymbolSchema).optional(),
})

// LibSymbols schema
const LibSymbolsSchema = z.object({
  symbols: z.array(SymbolDefinitionSchema),
})

// SymbolPin schema
const SymbolPinSchema = z.object({
  number: z.string(),
  uuid: z.string().optional(),
})

// PathInstance schema
const PathInstanceSchema = z.object({
  path: z.string(),
  reference: z.string(),
  unit: z.number(),
})

// ProjectInstance schema
const ProjectInstanceSchema = z.object({
  name: z.string(),
  path: PathInstanceSchema,
})

// Instances schema
const InstancesSchema = z.object({
  project: ProjectInstanceSchema,
})

// SymbolInstance schema
const SymbolInstanceSchema = z.object({
  lib_id: z.string(),
  at: AtSchema,
  unit: z.number(),
  exclude_from_sim: YesNo.optional(),
  in_bom: YesNo.optional(),
  on_board: YesNo.optional(),
  dnp: YesNo.optional(),
  fields_autoplaced: YesNo.optional(),
  uuid: z.string().optional(),
  properties: z.array(PropertySchema).optional(),
  pins: z.array(SymbolPinSchema).optional(),
  instances: InstancesSchema.optional(),
})

// Wire schema
const WireSchema = z.object({
  pts: z.array(PointSchema),
  stroke: StrokeSchema,
  uuid: z.string().optional(),
})

// SheetPath schema
const SheetPathSchema = z.object({
  path: z.string(),
  page: z.string(),
})

// SheetInstances schema
const SheetInstancesSchema = z.object({
  path: SheetPathSchema,
})

// KicadSch schema
export const KicadSchSchema = z.object({
  version: z.number(),
  generator: z.string(),
  generator_version: z.string(),
  uuid: z.string(),
  paper: z.string(),
  lib_symbols: LibSymbolsSchema.optional(),
  wires: z.array(WireSchema).optional(),
  symbols: z.array(SymbolInstanceSchema).optional(),
  sheet_instances: SheetInstancesSchema.optional(),
})

export {
  YesNo as YesNoSchema,
  PointSchema,
  AtSchema,
  FontSchema,
  EffectsSchema,
  PinNameSchema,
  PinNumberSchema,
  StrokeSchema,
  FillSchema,
  PolylineSchema,
  RectangleSchema,
  PinSchema,
  SubSymbolSchema,
  PropertySchema,
  PinNumbersSchema,
  PinNamesSchema,
  SymbolDefinitionSchema,
  LibSymbolsSchema,
  SymbolPinSchema,
  PathInstanceSchema,
  ProjectInstanceSchema,
  InstancesSchema,
  SymbolInstanceSchema,
  WireSchema,
  SheetPathSchema,
  SheetInstancesSchema,
}
