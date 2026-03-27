export function sanitizeFilename(filename: string) {
  // Keep it simple and safe for filesystem usage.
  return filename
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 120);
}

export function sanitizeTitle(title: string) {
  return title.replace(/\s+/g, " ").trim().slice(0, 200);
}

