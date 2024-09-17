import type { SExpr } from "../common/parse-sexpr"
import type {
  KicadSch,
  LibSymbols,
  SymbolDefinition,
  PinNumbers,
  PinNames,
  Property,
  At,
  Effects,
  Font,
  SubSymbol,
  Polyline,
  Rectangle,
  Stroke,
  Fill,
  Pin,
  SymbolInstance,
  SymbolPin,
  Instances,
  ProjectInstance,
  PathInstance,
  Wire,
  SheetInstances,
  SheetPath,
} from "./types"

// Function to serialize the KicadSch object into an S-expression string
export function serializeKicadSch(kicadSch: KicadSch): string {
  const sexpr = ["kicad_sch", ...serializeKicadSchContent(kicadSch)]
  return formatSExpr(sexpr)
}

// Helper function to serialize the content of KicadSch
function serializeKicadSchContent(kicadSch: KicadSch): SExpr[] {
  const content: SExpr[] = []

  content.push(["version", kicadSch.version.toString()])
  content.push(["generator", `"${kicadSch.generator}"`])
  content.push(["generator_version", `"${kicadSch.generator_version}"`])
  content.push(["uuid", `"${kicadSch.uuid}"`])
  content.push(["paper", `"${kicadSch.paper}"`])

  if (kicadSch.lib_symbols) {
    content.push(serializeLibSymbols(kicadSch.lib_symbols))
  }

  if (kicadSch.wires) {
    for (const wire of kicadSch.wires) {
      content.push(serializeWire(wire))
    }
  }

  if (kicadSch.symbols) {
    for (const symbol of kicadSch.symbols) {
      content.push(serializeSymbolInstance(symbol))
    }
  }

  if (kicadSch.sheet_instances) {
    content.push(serializeSheetInstances(kicadSch.sheet_instances))
  }

  return content
}

// Serialize lib_symbols
function serializeLibSymbols(libSymbols: LibSymbols): SExpr {
  const content: SExpr[] = ["lib_symbols"]

  for (const symbol of libSymbols.symbols) {
    content.push(serializeSymbolDefinition(symbol))
  }

  return content
}

// Serialize a symbol definition
function serializeSymbolDefinition(symbolDef: SymbolDefinition): SExpr {
  const content: SExpr[] = ["symbol", `"${symbolDef.name}"`]

  if (symbolDef.pin_numbers) {
    content.push(serializePinNumbers(symbolDef.pin_numbers))
  }

  if (symbolDef.pin_names) {
    content.push(serializePinNames(symbolDef.pin_names))
  }

  if (symbolDef.exclude_from_sim) {
    content.push(["exclude_from_sim", symbolDef.exclude_from_sim])
  }

  if (symbolDef.in_bom) {
    content.push(["in_bom", symbolDef.in_bom])
  }

  if (symbolDef.on_board) {
    content.push(["on_board", symbolDef.on_board])
  }

  if (symbolDef.properties) {
    for (const prop of symbolDef.properties) {
      content.push(serializeProperty(prop))
    }
  }

  if (symbolDef.symbols) {
    for (const subsymbol of symbolDef.symbols) {
      content.push(serializeSubSymbol(subsymbol))
    }
  }

  return content
}

// Serialize pin_numbers
function serializePinNumbers(pinNumbers: PinNumbers): SExpr {
  const content: SExpr[] = ["pin_numbers"]

  if (pinNumbers.hide) {
    content.push(["hide"])
  }

  return content
}

// Serialize pin_names
function serializePinNames(pinNames: PinNames): SExpr {
  const content: SExpr[] = ["pin_names"]

  content.push(["offset", pinNames.offset.toString()])

  return content
}

// Serialize property
function serializeProperty(property: Property): SExpr {
  const content: SExpr[] = [
    "property",
    `"${property.name}"`,
    `"${property.value}"`,
  ]

  if (property.at) {
    content.push(serializeAt(property.at))
  }

  if (property.effects) {
    content.push(serializeEffects(property.effects))
  }

  return content
}

// Serialize at
function serializeAt(at: At): SExpr {
  const content: SExpr[] = ["at", at.x.toString(), at.y.toString()]

  if (at.rotation !== undefined) {
    content.push(at.rotation.toString())
  }

  return content
}

// Serialize effects
function serializeEffects(effects: Effects): SExpr {
  const content: SExpr[] = ["effects"]

  if (effects.font) {
    content.push(serializeFont(effects.font))
  }

  if (effects.justify) {
    content.push(["justify", effects.justify])
  }

  if (effects.hide) {
    content.push(["hide", "yes"])
  }

  return content
}

// Serialize font
function serializeFont(font: Font): SExpr {
  const content: SExpr[] = [
    "font",
    ["size", font.size[0].toString(), font.size[1].toString()],
  ]

  return content
}

// Serialize a subsymbol
function serializeSubSymbol(subsymbol: SubSymbol): SExpr {
  const content: SExpr[] = ["symbol", `"${subsymbol.name}"`]

  if (subsymbol.polylines) {
    for (const polyline of subsymbol.polylines) {
      content.push(serializePolyline(polyline))
    }
  }

  if (subsymbol.rectangles) {
    for (const rectangle of subsymbol.rectangles) {
      content.push(serializeRectangle(rectangle))
    }
  }

  if (subsymbol.pins) {
    for (const pin of subsymbol.pins) {
      content.push(serializePin(pin))
    }
  }

  return content
}

// Serialize polyline
function serializePolyline(polyline: Polyline): SExpr {
  const content: SExpr[] = ["polyline"]

  content.push([
    "pts",
    ...polyline.pts.map((pt) => ["xy", pt.x.toString(), pt.y.toString()]),
  ])
  content.push(serializeStroke(polyline.stroke))
  content.push(serializeFill(polyline.fill))

  return content
}

// Serialize rectangle
function serializeRectangle(rectangle: Rectangle): SExpr {
  const content: SExpr[] = ["rectangle"]

  content.push([
    "start",
    rectangle.start.x.toString(),
    rectangle.start.y.toString(),
  ])
  content.push(["end", rectangle.end.x.toString(), rectangle.end.y.toString()])
  content.push(serializeStroke(rectangle.stroke))
  content.push(serializeFill(rectangle.fill))

  return content
}

// Serialize stroke
function serializeStroke(stroke: Stroke): SExpr {
  const content: SExpr[] = ["stroke", ["width", stroke.width.toString()]]

  if (stroke.type) {
    content.push(["type", stroke.type])
  }

  return content
}

// Serialize fill
function serializeFill(fill: Fill): SExpr {
  const content: SExpr[] = ["fill", ["type", fill.type]]

  return content
}

// Serialize pin
function serializePin(pin: Pin): SExpr {
  const content: SExpr[] = ["pin", pin.type, pin.shape]

  content.push(serializeAt(pin.at))
  content.push(["length", pin.length.toString()])

  if (pin.name) {
    content.push([
      "name",
      `"${pin.name.name}"`,
      ...(pin.name.effects ? [serializeEffects(pin.name.effects)] : []),
    ])
  }

  if (pin.number) {
    content.push([
      "number",
      `"${pin.number.number}"`,
      ...(pin.number.effects ? [serializeEffects(pin.number.effects)] : []),
    ])
  }

  return content
}

// Serialize symbol instance
function serializeSymbolInstance(symbol: SymbolInstance): SExpr {
  const content: SExpr[] = ["symbol"]

  content.push(["lib_id", `"${symbol.lib_id}"`])
  content.push(serializeAt(symbol.at))
  content.push(["unit", symbol.unit.toString()])

  if (symbol.exclude_from_sim) {
    content.push(["exclude_from_sim", symbol.exclude_from_sim])
  }

  if (symbol.in_bom) {
    content.push(["in_bom", symbol.in_bom])
  }

  if (symbol.on_board) {
    content.push(["on_board", symbol.on_board])
  }

  if (symbol.dnp) {
    content.push(["dnp", symbol.dnp])
  }

  if (symbol.fields_autoplaced) {
    content.push(["fields_autoplaced", symbol.fields_autoplaced])
  }

  if (symbol.uuid) {
    content.push(["uuid", `"${symbol.uuid}"`])
  }

  if (symbol.properties) {
    for (const prop of symbol.properties) {
      content.push(serializeProperty(prop))
    }
  }

  if (symbol.pins) {
    for (const pin of symbol.pins) {
      content.push(serializeSymbolPin(pin))
    }
  }

  if (symbol.instances) {
    content.push(serializeInstances(symbol.instances))
  }

  return content
}

// Serialize symbol pin
function serializeSymbolPin(pin: SymbolPin): SExpr {
  const content: SExpr[] = ["pin", `"${pin.number}"`]

  if (pin.uuid) {
    content.push(["uuid", `"${pin.uuid}"`])
  }

  return content
}

// Serialize instances
function serializeInstances(instances: Instances): SExpr {
  const content: SExpr[] = ["instances"]

  content.push(serializeProjectInstance(instances.project))

  return content
}

// Serialize project instance
function serializeProjectInstance(project: ProjectInstance): SExpr {
  const content: SExpr[] = ["project", `"${project.name}"`]

  content.push(serializePathInstance(project.path))

  return content
}

// Serialize path instance
function serializePathInstance(path: PathInstance): SExpr {
  const content: SExpr[] = ["path", `"${path.path}"`]

  content.push(["reference", `"${path.reference}"`])
  content.push(["unit", path.unit.toString()])

  return content
}

// Serialize wire
function serializeWire(wire: Wire): SExpr {
  const content: SExpr[] = ["wire"]

  content.push([
    "pts",
    ...wire.pts.map((pt) => ["xy", pt.x.toString(), pt.y.toString()]),
  ])
  content.push(serializeStroke(wire.stroke))

  if (wire.uuid) {
    content.push(["uuid", `"${wire.uuid}"`])
  }

  return content
}

// Serialize sheet instances
function serializeSheetInstances(sheetInstances: SheetInstances): SExpr {
  const content: SExpr[] = ["sheet_instances"]

  content.push(serializeSheetPath(sheetInstances.path))

  return content
}

// Serialize sheet path
function serializeSheetPath(sheetPath: SheetPath): SExpr {
  const content: SExpr[] = ["path", `"${sheetPath.path}"`]

  content.push(["page", `"${sheetPath.page}"`])

  return content
}
