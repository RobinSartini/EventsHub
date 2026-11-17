export function plural(count: number, word: string): string {
  return count > 1 ? `${word}s` : word;
}
