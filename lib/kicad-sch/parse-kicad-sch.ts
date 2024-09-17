import { SExpr } from "../common/parse-sexpr"
import {
  At,
  Effects,
  Fill,
  Font,
  Instances,
  KicadSch,
  LibSymbols,
  PathInstance,
  Pin,
  PinName,
  PinNames,
  PinNumber,
  PinNumbers,
  Point,
  Polyline,
  ProjectInstance,
  Property,
  Rectangle,
  SheetInstances,
  SheetPath,
  Stroke,
  SubSymbol,
  SymbolDefinition,
  SymbolInstance,
  SymbolPin,
  Wire,
  YesNo,
} from "./types"

// Function to parse the SExpr into the KicadSch structure
export function parseKicadSch(sexpr: SExpr): KicadSch {
  if (!Array.isArray(sexpr)) {
    throw new Error("Invalid S-expression format for kicad_sch.")
  }

  const root = sexpr as SExpr[]
  const kicadSch: Partial<KicadSch> = {}

  // The first element should be 'kicad_sch'
  if (root[0] !== "kicad_sch") {
    throw new Error("Not a kicad_sch file.")
  }

  // Process the rest of the elements
  for (let i = 1; i < root.length; i++) {
    const element = root[i]
    if (!Array.isArray(element)) continue

    const [key, ...args] = element

    switch (key) {
      case "version":
        kicadSch.version = parseInt(args[0] as string, 10)
        break

      case "generator":
        kicadSch.generator = args[0] as string
        break

      case "generator_version":
        kicadSch.generator_version = args[0] as string
        break

      case "uuid":
        kicadSch.uuid = args[0] as string
        break

      case "paper":
        kicadSch.paper = args[0] as string
        break

      case "lib_symbols":
        kicadSch.lib_symbols = parseLibSymbols(element)
        break

      case "wire":
        if (!kicadSch.wires) kicadSch.wires = []
        kicadSch.wires.push(parseWire(element))
        break

      case "symbol":
        if (!kicadSch.symbols) kicadSch.symbols = []
        kicadSch.symbols.push(parseSymbolInstance(element))
        break

      case "sheet_instances":
        kicadSch.sheet_instances = parseSheetInstances(element)
        break

      default:
        // Handle other keys if necessary
        break
    }
  }

  return kicadSch as KicadSch
}

// Parser functions for different elements

function parseLibSymbols(sexpr: SExpr): LibSymbols {
  const symbols: SymbolDefinition[] = []

  for (let i = 1; i < sexpr.length; i++) {
    const element = sexpr[i] as SExpr[]
    if (element[0] === "symbol") {
      symbols.push(parseSymbolDefinition(element))
    }
  }

  return { symbols }
}

function parseSymbolDefinition(sexpr: SExpr): SymbolDefinition {
  const symbolDef: Partial<SymbolDefinition> = {}
  const [, name, ...args] = sexpr
  symbolDef.name = name as string
  symbolDef.properties = []
  symbolDef.symbols = []

  for (const element of args) {
    if (!Array.isArray(element)) continue
    const [key, ...rest] = element

    switch (key) {
      case "pin_numbers":
        symbolDef.pin_numbers = parsePinNumbers(element)
        break

      case "pin_names":
        symbolDef.pin_names = parsePinNames(element)
        break

      case "exclude_from_sim":
        symbolDef.exclude_from_sim = rest[0] as YesNo
        break

      case "in_bom":
        symbolDef.in_bom = rest[0] as YesNo
        break

      case "on_board":
        symbolDef.on_board = rest[0] as YesNo
        break

      case "property":
        symbolDef.properties!.push(parseProperty(element))
        break

      case "symbol":
        symbolDef.symbols!.push(parseSubSymbol(element))
        break

      default:
        // Handle other keys if necessary
        break
    }
  }

  return symbolDef as SymbolDefinition
}

function parsePinNumbers(sexpr: SExpr): PinNumbers {
  const pinNumbers: PinNumbers = {}
  for (const element of sexpr.slice(1)) {
    if (!Array.isArray(element)) continue
    const [key, ...rest] = element
    if (key === "hide") {
      pinNumbers.hide = true
    }
  }
  return pinNumbers
}

function parsePinNames(sexpr: SExpr): PinNames {
  const pinNames: PinNames = {}
  for (const element of sexpr.slice(1)) {
    if (!Array.isArray(element)) continue
    const [key, value] = element
    if (key === "offset") {
      pinNames.offset = parseFloat(value as string)
    }
  }
  return pinNames
}

function parseProperty(sexpr: SExpr): Property {
  const [, name, value, ...args] = sexpr
  const property: Partial<Property> = {
    name: name as string,
    value: value as string,
  }

  for (const element of args) {
    if (!Array.isArray(element)) continue
    const [key, ...rest] = element
    switch (key) {
      case "at":
        property.at = parseAt(element)
        break
      case "effects":
        property.effects = parseEffects(element)
        break
      default:
        break
    }
  }

  return property as Property
}

function parseAt(sexpr: SExpr): At {
  const [, xStr, yStr, rotationStr] = sexpr
  const at: At = {
    x: parseFloat(xStr as string),
    y: parseFloat(yStr as string),
  }
  if (rotationStr) {
    at.rotation = parseFloat(rotationStr as string)
  }
  return at
}

function parseEffects(sexpr: SExpr): Effects {
  const effects: Partial<Effects> = {}
  for (const element of sexpr.slice(1)) {
    if (!Array.isArray(element)) continue
    const [key, ...rest] = element
    switch (key) {
      case "font":
        effects.font = parseFont(element)
        break
      case "justify":
        effects.justify = rest[0] as string
        break
      case "hide":
        effects.hide = rest[0] === "yes"
        break
      default:
        break
    }
  }
  return effects as Effects
}

function parseFont(sexpr: SExpr): Font {
  const font: Partial<Font> = {}
  for (const element of sexpr.slice(1)) {
    if (!Array.isArray(element)) continue
    const [key, xStr, yStr] = element
    if (key === "size") {
      font.size = [parseFloat(xStr as string), parseFloat(yStr as string)]
    }
  }
  return font as Font
}

function parseSubSymbol(sexpr: SExpr): SubSymbol {
  const [, name, ...args] = sexpr
  const subSymbol: Partial<SubSymbol> = { name: name as string }

  for (const element of args) {
    if (!Array.isArray(element)) continue
    const [key, ...rest] = element
    switch (key) {
      case "polyline":
        if (!subSymbol.polylines) subSymbol.polylines = []
        subSymbol.polylines.push(parsePolyline(element))
        break
      case "rectangle":
        if (!subSymbol.rectangles) subSymbol.rectangles = []
        subSymbol.rectangles.push(parseRectangle(element))
        break
      case "pin":
        if (!subSymbol.pins) subSymbol.pins = []
        subSymbol.pins.push(parsePin(element))
        break
      default:
        break
    }
  }

  return subSymbol as SubSymbol
}

function parsePolyline(sexpr: SExpr): Polyline {
  const polyline: Partial<Polyline> = {}
  for (const element of sexpr.slice(1)) {
    if (!Array.isArray(element)) continue
    const [key, ...rest] = element
    switch (key) {
      case "pts":
        polyline.pts = parsePoints(element)
        break
      case "stroke":
        polyline.stroke = parseStroke(element)
        break
      case "fill":
        polyline.fill = parseFill(element)
        break
      default:
        break
    }
  }
  return polyline as Polyline
}

function parseRectangle(sexpr: SExpr): Rectangle {
  const rectangle: Partial<Rectangle> = {}
  for (const element of sexpr.slice(1)) {
    if (!Array.isArray(element)) continue
    const [key, ...rest] = element
    switch (key) {
      case "start":
        rectangle.start = parsePoint(element)
        break
      case "end":
        rectangle.end = parsePoint(element)
        break
      case "stroke":
        rectangle.stroke = parseStroke(element)
        break
      case "fill":
        rectangle.fill = parseFill(element)
        break
      default:
        break
    }
  }
  return rectangle as Rectangle
}

function parsePoints(sexpr: SExpr): Point[] {
  const points: Point[] = []
  for (const element of sexpr.slice(1)) {
    if (!Array.isArray(element)) continue
    if (element[0] === "xy") {
      points.push(parsePoint(element))
    }
  }
  return points
}

function parsePoint(sexpr: SExpr): Point {
  const [, xStr, yStr] = sexpr
  return {
    x: parseFloat(xStr as string),
    y: parseFloat(yStr as string),
  }
}

function parseStroke(sexpr: SExpr): Stroke {
  const stroke: Partial<Stroke> = {}
  for (const element of sexpr.slice(1)) {
    if (!Array.isArray(element)) continue
    const [key, value] = element
    switch (key) {
      case "width":
        stroke.width = parseFloat(value as string)
        break
      case "type":
        stroke.type = value as string
        break
      default:
        break
    }
  }
  return stroke as Stroke
}

function parseFill(sexpr: SExpr): Fill {
  const [, ...rest] = sexpr
  const fill: Partial<Fill> = {}
  for (const element of rest) {
    if (!Array.isArray(element)) continue
    const [key, value] = element
    if (key === "type") {
      fill.type = value as string
    }
  }
  return fill as Fill
}

function parsePin(sexpr: SExpr): Pin {
  const [, type, shape, ...args] = sexpr
  const pin: Partial<Pin> = { type: type as string, shape: shape as string }

  for (const element of args) {
    if (!Array.isArray(element)) continue
    const [key, ...rest] = element
    switch (key) {
      case "at":
        pin.at = parseAt(element)
        break
      case "length":
        pin.length = parseFloat(rest[0] as string)
        break
      case "name":
        pin.name = parsePinNameOrNumber(element) as PinName
        break
      case "number":
        pin.number = parsePinNameOrNumber(element) as PinNumber
        break
      default:
        break
    }
  }

  return pin as Pin
}

function parsePinNameOrNumber(sexpr: SExpr): PinName | PinNumber {
  const [, value, ...args] = sexpr
  const pinData: Partial<PinName | PinNumber> = {
    name: value as string,
    number: value as string,
  }
  for (const element of args) {
    if (!Array.isArray(element)) continue
    const [key, ...rest] = element
    if (key === "effects") {
      pinData.effects = parseEffects(element)
    }
  }
  return pinData as PinName | PinNumber
}

function parseSymbolInstance(sexpr: SExpr): SymbolInstance {
  const symbolInstance: Partial<SymbolInstance> = {}
  const [, ...args] = sexpr
  symbolInstance.properties = []
  symbolInstance.pins = []

  for (const element of args) {
    if (!Array.isArray(element)) continue
    const [key, ...rest] = element
    switch (key) {
      case "lib_id":
        symbolInstance.lib_id = rest[0] as string
        break
      case "at":
        symbolInstance.at = parseAt(element)
        break
      case "unit":
        symbolInstance.unit = parseInt(rest[0] as string, 10)
        break
      case "exclude_from_sim":
        symbolInstance.exclude_from_sim = rest[0] as YesNo
        break
      case "in_bom":
        symbolInstance.in_bom = rest[0] as YesNo
        break
      case "on_board":
        symbolInstance.on_board = rest[0] as YesNo
        break
      case "dnp":
        symbolInstance.dnp = rest[0] as YesNo
        break
      case "fields_autoplaced":
        symbolInstance.fields_autoplaced = rest[0] as YesNo
        break
      case "uuid":
        symbolInstance.uuid = rest[0] as string
        break
      case "property":
        symbolInstance.properties!.push(parseProperty(element))
        break
      case "pin":
        symbolInstance.pins!.push(parseSymbolPin(element))
        break
      case "instances":
        symbolInstance.instances = parseInstances(element)
        break
      default:
        break
    }
  }

  return symbolInstance as SymbolInstance
}

function parseSymbolPin(sexpr: SExpr): SymbolPin {
  const [, numberStr, ...args] = sexpr
  const pin: Partial<SymbolPin> = { number: numberStr as string }
  for (const element of args) {
    if (!Array.isArray(element)) continue
    const [key, value] = element
    if (key === "uuid") {
      pin.uuid = value as string
    }
  }
  return pin as SymbolPin
}

function parseInstances(sexpr: SExpr): Instances {
  const projectInstance: Partial<ProjectInstance> = {}
  for (const element of sexpr.slice(1)) {
    if (!Array.isArray(element)) continue
    const [key, ...rest] = element
    if (key === "project") {
      projectInstance.name = rest[0] as string
      projectInstance.path = parsePathInstance(element)
    }
  }
  return { project: projectInstance as ProjectInstance }
}

function parsePathInstance(sexpr: SExpr): PathInstance {
  const [, name, ...args] = sexpr
  const pathInstance: Partial<PathInstance> = {}
  for (const element of args) {
    if (!Array.isArray(element)) continue
    const [key, ...rest] = element
    if (key === "path") {
      pathInstance.path = rest[0] as string
      for (const subElement of rest.slice(1)) {
        if (!Array.isArray(subElement)) continue
        const [subKey, subValue] = subElement
        if (subKey === "reference") {
          pathInstance.reference = subValue as string
        } else if (subKey === "unit") {
          pathInstance.unit = parseInt(subValue as string, 10)
        }
      }
    }
  }
  return pathInstance as PathInstance
}

function parseWire(sexpr: SExpr): Wire {
  const wire: Partial<Wire> = {}
  for (const element of sexpr.slice(1)) {
    if (!Array.isArray(element)) continue
    const [key, ...rest] = element
    switch (key) {
      case "pts":
        wire.pts = parsePoints(element)
        break
      case "stroke":
        wire.stroke = parseStroke(element)
        break
      case "uuid":
        wire.uuid = rest[0] as string
        break
      default:
        break
    }
  }
  return wire as Wire
}

function parseSheetInstances(sexpr: SExpr): SheetInstances {
  const [, pathElement] = sexpr
  const sheetInstances: SheetInstances = {
    path: parseSheetPath(pathElement as SExpr),
  }
  return sheetInstances
}

function parseSheetPath(sexpr: SExpr): SheetPath {
  const [, pathStr, ...args] = sexpr
  const sheetPath: SheetPath = { path: pathStr as string }
  for (const element of args) {
    if (!Array.isArray(element)) continue
    const [key, value] = element
    if (key === "page") {
      sheetPath.page = value as string
    }
  }
  return sheetPath
}
