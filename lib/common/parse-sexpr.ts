// Utility types for parsing
export type SExpr = string | SExpr[]

export function parseSExpr(input: string): SExpr {
  const tokens = tokenize(input)
  const [expr, _] = parseTokens(tokens)

  // If expr is an array and the first element is another array, unwrap it
  if (Array.isArray(expr) && expr.length === 1 && Array.isArray(expr[0])) {
    return expr[0]
  }
  return expr
}

function tokenize(input: string): string[] {
  const tokens: string[] = []
  let current = ""
  let inString = false

  for (let i = 0; i < input.length; i++) {
    const char = input[i]

    if (char === '"') {
      if (inString) {
        // End of string
        tokens.push(current)
        current = ""
        inString = false
      } else {
        // Start of string
        inString = true
      }
    } else if (inString) {
      current += char
    } else if (/\s/.test(char)) {
      if (current !== "") {
        tokens.push(current)
        current = ""
      }
    } else if (char === "(" || char === ")") {
      if (current !== "") {
        tokens.push(current)
        current = ""
      }
      tokens.push(char)
    } else {
      current += char
    }
  }
  if (current !== "") {
    tokens.push(current)
  }
  return tokens
}

function parseTokens(tokens: string[], index = 0): [SExpr, number] {
  const result: SExpr[] = []

  while (index < tokens.length) {
    const token = tokens[index]

    if (token === "(") {
      index += 1
      const [expr, newIndex] = parseTokens(tokens, index)
      result.push(expr)
      index = newIndex
    } else if (token === ")") {
      return [result, index + 1]
    } else {
      result.push(token)
      index += 1
    }
  }
  return [result, index]
}
