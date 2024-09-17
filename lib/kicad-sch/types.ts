export interface KicadSch {
  version: number
  generator: string
  generator_version: string
  uuid: string
  paper: string
  lib_symbols?: LibSymbols
  wires?: Wire[]
  symbols?: SymbolInstance[]
  sheet_instances?: SheetInstances
}

export interface LibSymbols {
  symbols: SymbolDefinition[]
}

export interface SymbolDefinition {
  name: string // Symbol name, e.g., "Device:C"
  pin_numbers?: PinNumbers
  pin_names?: PinNames
  exclude_from_sim?: YesNo
  in_bom?: YesNo
  on_board?: YesNo
  properties?: Property[]
  symbols?: SubSymbol[]
}

export interface PinNumbers {
  hide?: boolean
}

export interface PinNames {
  offset: number
}

export interface Property {
  name: string
  value: string
  at?: At
  effects?: Effects
}

export interface At {
  x: number
  y: number
  rotation?: number
}

export interface Effects {
  font?: Font
  justify?: string
  hide?: boolean
}

export interface Font {
  size: [number, number]
}

export interface SubSymbol {
  name: string
  polylines?: Polyline[]
  rectangles?: Rectangle[]
  pins?: Pin[]
}

export interface Polyline {
  pts: Point[]
  stroke: Stroke
  fill: Fill
}

export interface Rectangle {
  start: Point
  end: Point
  stroke: Stroke
  fill: Fill
}

export interface Pin {
  type: string
  shape: string
  at: At
  length: number
  name: PinName
  number: PinNumber
}

export interface PinName {
  name: string
  effects?: Effects
}

export interface PinNumber {
  number: string
  effects?: Effects
}

export interface Stroke {
  width: number
  type?: string
}

export interface Fill {
  type: string
}

export interface Point {
  x: number
  y: number
}

export interface SymbolInstance {
  lib_id: string
  at: At
  unit: number
  exclude_from_sim?: YesNo
  in_bom?: YesNo
  on_board?: YesNo
  dnp?: YesNo
  fields_autoplaced?: YesNo
  uuid?: string
  properties?: Property[]
  pins?: SymbolPin[]
  instances?: Instances
}

export interface SymbolPin {
  number: string
  uuid?: string
}

export interface Instances {
  project: ProjectInstance
}

export interface ProjectInstance {
  name: string
  path: PathInstance
}

export interface PathInstance {
  path: string
  reference: string
  unit: number
}

export interface Wire {
  pts: Point[]
  stroke: Stroke
  uuid?: string
}

export interface SheetInstances {
  path: SheetPath
}

export interface SheetPath {
  path: string
  page: string
}

export type YesNo = "yes" | "no"
