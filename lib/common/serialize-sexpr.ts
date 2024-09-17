import { SExpr } from "./parse-sexpr"

// Utility function to format the S-expression array into a string
export function formatSExpr(sexpr: SExpr): string {
  if (typeof sexpr === "string") {
    return sexpr
  } else if (Array.isArray(sexpr)) {
    const inner = sexpr.map(formatSExpr).join(" ")
    return `(${inner})`
  }
  return ""
}
