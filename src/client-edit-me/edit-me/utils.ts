export function calculateDelta(oldValue: number, newValue: number) {
  return (newValue * 100) / oldValue - 100;
}

export function formatDelta(value: number): string {
  const fixed = Math.abs(value).toFixed(3);
  return value > 0 ? `+ ${fixed}` : `- ${fixed}`;
}

export function getInstrumentLogoPath(category: string, code: string): string {
  return new URL(`../../../public/${category}/${code}.svg`, import.meta.url)
    .href;
}
