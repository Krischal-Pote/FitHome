export type HUnit = 'cm' | 'm' | 'ft';

export const toCm = (u: HUnit, a: number, inch = 0) => (u === 'cm' ? a : u === 'm' ? a * 100 : (a * 12 + inch) * 2.54);

export function fromCm(u: HUnit, cm: number): [string, string] {
  if (u === 'cm') return [String(Math.round(cm)), ''];
  if (u === 'm') return [(cm / 100).toFixed(2), ''];
  const totalIn = Math.round(cm / 2.54);
  return [String(Math.floor(totalIn / 12)), String(totalIn % 12)];
}
