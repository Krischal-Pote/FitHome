import type { Profile } from '../types.ts';

export type Diet = { kcal: number; protein: number; carbs: number; fat: number; meals: { name: string; kcal: number }[] };

// Mifflin-St Jeor BMR x activity factor from workout days/week, then +/-500 kcal toward goal weight.
// Floor of 1200 kcal. Estimate only, not medical advice.
export function dietPlan(p: Profile, kg: number): Diet | null {
  if (!p.cm || !p.age || !p.sex) return null;
  const bmr = 10 * kg + 6.25 * p.cm - 5 * p.age + (p.sex === 'male' ? 5 : -161);
  const factor = 1.2 + 0.05 * Math.min(p.days.length, 6); // 1.25 .. 1.5
  const tdee = bmr * factor;
  const target = Math.max(1200, Math.round(tdee + (p.goal < kg ? -500 : p.goal > kg ? 300 : 0)));
  const protein = Math.round(1.8 * kg);
  const fat = Math.round((target * 0.25) / 9);
  const carbs = Math.max(0, Math.round((target - protein * 4 - fat * 9) / 4));
  const split: [string, number][] = [['Breakfast', 0.25], ['Lunch', 0.35], ['Snack', 0.1], ['Dinner', 0.3]];
  return { kcal: target, protein, carbs, fat, meals: split.map(([name, f]) => ({ name, kcal: Math.round(target * f) })) };
}
