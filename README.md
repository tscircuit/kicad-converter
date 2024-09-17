# KiCad Converter

[![npm version](https://badge.fury.io/js/kicad-converter.svg)](https://badge.fury.io/js/kicad-converter)

KiCad Converter is a TypeScript library that facilitates seamless conversion between KiCad file formats, JSON, and [Circuit JSON](https://docs.tscircuit.com/api-reference/advanced/soup)

## Table of Contents

- [KiCad Converter](#kicad-converter)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Installation](#installation)
  - [Usage](#usage)
  - [API Reference](#api-reference)
  - [Advanced Usage](#advanced-usage)
    - [Working with KiCad Project Files](#working-with-kicad-project-files)
    - [Type Checking with Zod](#type-checking-with-zod)
  - [Contributing](#contributing)
  - [License](#license)
  - [Support](#support)

## Features

- Convert KiCad PCB files `*.kicad_pcb` to Circuit JSON
- Convert Circuit JSON to KiCad PCB files `*.kicad_pcb`
- Parse and serialize KiCad schematic files `*.kicad_sch`
- Support for KiCad project files (`*.kicad_pro`)
- Robust type checking using Zod schemas
- Easy integration with existing KiCad and tscircuit workflows

## Installation

Install KiCad Converter using npm:

```bash
npm install kicad-converter
```

## Usage

Here's a basic example of how to use KiCad Converter:

```typescript
import { convertKiCadPcbToCircuitJson, convertCircuitJsonToKiCadPcb, parseKiCadSch } from 'kicad-converter';

import kicadPcb from "./path/to/your/kicad_pcb_file.kicad_pcb" with { type: "text" }

// Convert KiCad PCB to Circuit JSON
const circuitJson = convertKiCadPcbToCircuitJson(kicadPcb);

// Convert Circuit JSON to KiCad PCB
const newKicadPcb = convertCircuitJsonToKiCadPcb(circuitJson);
```

## API Reference

The library exposes several key functions:

- `convertKiCadPcbToCircuitJson(kicadPcb: KiCadPcb): AnyCircuitElement[]`
  Converts a KiCad PCB object to Circuit JSON format.

- `convertCircuitJsonToKiCadPcb(circuitJson: AnyCircuitElement[]): KiCadPcb`
  Converts Circuit JSON to a KiCad PCB object.

- `parseKiCadSch(sexpr: SExpr): KicadSch`
  Parses a KiCad schematic S-expression into a structured object.

- `serializeKiCadSch(kicadSch: KicadSch): string`
  Serializes a KiCad schematic object back into an S-expression string.

## Advanced Usage

### Working with KiCad Project Files

```typescript
import { parseKiCadPro } from 'kicad-converter';

const projectFile = // ... load your .kicad_pro file content
const parsedProject = parseKiCadPro(projectFile);

console.log(parsedProject.meta.filename);
```

### Type Checking with Zod

KiCad Converter uses Zod for robust type checking. You can leverage this in your own code:

```typescript
import { KiCadPcbSchema } from "kicad-converter"

const validatedPcb = KiCadPcbSchema.parse(someData)
// If someData doesn't match the schema, this will throw an error
```

## Contributing

We welcome contributions to KiCad Converter! Please see our [Contributing Guide](CONTRIBUTING.md) for more details on how to get started.

To set up the development environment:

1. Clone the repository
2. Install dependencies: `bun install`
3. Run tests: `bun test test`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please file an issue on the [GitHub repository](https://github.com/yourusername/kicad-converter/issues).
