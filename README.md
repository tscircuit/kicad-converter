# KiCad Converter

[![npm version](https://badge.fury.io/js/kicad-converter.svg)](https://badge.fury.io/js/kicad-converter)

KiCad Converter typescript that facilitates seamless conversion between KiCad file formats, JSON and [Circuit JSON](https://docs.tscircuit.com/api-reference/advanced/soup). This tool is designed to bridge the gap between KiCad, a popular open-source electronics design automation suite, and tscircuit, a TypeScript-based circuit design library.

## Features

- Convert KiCad PCB files to Circuit JSON
- Convert Circuit JSON to KiCad PCB files
- Parse and serialize KiCad schematic files
- Support for KiCad project files (.pro)
- Robust type checking using Zod schemas

## Installation

```bash
npm install kicad-converter
```

## Usage

Here's a basic example of how to use KiCad Converter:

```typescript
import { convertKiCadPcbToCircuitJson, convertCircuitJsonToKiCadPcb } from 'kicad-converter';

// Convert KiCad PCB to Circuit JSON
const kicadPcb = // ... load your KiCad PCB data
const circuitJson = convertKiCadPcbToCircuitJson(kicadPcb);

// Convert Circuit JSON to KiCad PCB
const newKicadPcb = convertCircuitJsonToKiCadPcb(circuitJson);
```

## API Reference

The library exposes several key functions:

- `convertKiCadPcbToCircuitJson(kicadPcb: KiCadPcb): AnyCircuitElement[]`
- `convertCircuitJsonToKiCadPcb(circuitJson: AnyCircuitElement[]): KiCadPcb`
- `parseKiCadSch(sexpr: SExpr): KicadSch`
- `serializeKiCadSch(kicadSch: KicadSch): string`

## Contributing

We welcome contributions to KiCad Converter! Please see our [Contributing Guide](CONTRIBUTING.md) for more details on how to get started.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
