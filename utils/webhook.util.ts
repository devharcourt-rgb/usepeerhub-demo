export function extractRef(input: string): string | null {
  const match = input.match(/^ref:\s*(.+)$/i);
  return match ? match[1].trim() : null;
}
