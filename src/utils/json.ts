export function safeJsonParse<T>(text: string): T {
  const trimmed = text.trim();

  // Try to locate JSON in a messy model response.
  const firstBrace = trimmed.indexOf("{");
  const firstBracket = trimmed.indexOf("[");
  const start =
    firstBrace === -1 ? firstBracket : firstBracket === -1 ? firstBrace : Math.min(firstBrace, firstBracket);

  const endObj = trimmed.lastIndexOf("}");
  const endArr = trimmed.lastIndexOf("]");
  const end = Math.max(endObj, endArr);

  const candidate = start !== -1 && end !== -1 ? trimmed.slice(start, end + 1) : trimmed;

  return JSON.parse(candidate) as T;
}

