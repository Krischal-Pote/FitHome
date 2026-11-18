export type HUnit = 'cm' | 'm' | 'ft';

export const toCm = (u: HUnit, a: number, inch = 0) => (u === 'cm' ? a : u === 'm' ? a * 100 : (a * 12 + inch) * 2.54);

export function fromCm(u: HUnit, cm: number): [string, string] {
  if (u === 'cm') return [String(Math.round(cm)), ''];
  if (u === 'm') return [(cm / 100).toFixed(2), ''];
  const totalIn = Math.round(cm / 2.54);
  return [String(Math.floor(totalIn / 12)), String(totalIn % 12)];
}

// Walking ~0.57 kcal per kg per km, stride ~0.76 m => ~0.00043 kcal per step per kg.
export const stepKcal = (steps: number, kg: number) => Math.round(steps * kg * 0.00043);
