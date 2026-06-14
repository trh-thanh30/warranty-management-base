const htmlEntities: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
};

export function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(/[&<>"]/g, (character) => htmlEntities[character] ?? character);
}
