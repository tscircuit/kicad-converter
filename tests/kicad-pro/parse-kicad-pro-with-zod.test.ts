import { test, expect } from "bun:test"
import { KicadProjectSchema } from "lib/kicad-pro/zod"
// @ts-ignore
import testKiCadProJsonRaw from "../assets/testkicadproject/testkicadproject.kicad_pro" with {
  type: "text",
}

test("parse-kicad-pro-with-zod", () => {
  const kicadProject = KicadProjectSchema.parse(JSON.parse(testKiCadProJsonRaw))

  expect(kicadProject.meta.filename).toBe("testkicadproject.kicad_pro")
})
