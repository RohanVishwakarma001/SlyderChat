/** Deterministic tonal gradient pairs for initials avatars, picked to sit well with the app palette. */
const GRADIENT_PAIRS: [string, string][] = [
  ['#006d2f', '#25d366'],
  ['#1c695f', '#5fc9b8'],
  ['#93492e', '#ffa07e'],
  ['#3a5ba0', '#79a6ff'],
  ['#7b3fa0', '#c58aff'],
  ['#a05f1c', '#ffc46b'],
  ['#0f766e', '#5eead4'],
  ['#9d174d', '#fb7185'],
];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function gradientForName(name: string): [string, string] {
  const idx = hashString(name || '?') % GRADIENT_PAIRS.length;
  return GRADIENT_PAIRS[idx];
}

export function initialsForName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
