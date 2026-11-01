import type { Profile } from '../types.ts';

export type Diet = { kcal: number; protein: number; carbs: number; fat: number; meals: { name: string; kcal: number; food: string }[] };

// Base meals (kcal per serving); portion is scaled to the slot's calorie target. Vegetarian-friendly.
const FOOD: Record<string, [string, number][]> = {
  Breakfast: [['Oats + banana + milk', 350], ['Eggs on toast + fruit', 400], ['Poha/upma + curd', 380]],
  Lunch: [['Rice + dal + veg curry', 550], ['Roti + paneer/chicken + salad', 500], ['Rice + eggs + greens', 520]],
  Snack: [['Peanuts + fruit', 220], ['Curd + seeds', 180], ['Roasted chana + tea', 200]],
  Dinner: [['Roti + dal + veg', 450], ['Rice + chicken/tofu + veg', 500], ['Khichdi + curd', 420]],
};

// Mifflin-St Jeor BMR x activity factor from workout days/week, then +/-500 kcal toward goal weight.
// Floor of 1200 kcal. Estimate only, not medical advice.
export function dietPlan(p: Profile, kg: number, seed = 0): Diet | null {
  if (!p.cm || !p.age || !p.sex) return null;
  const bmr = 10 * kg + 6.25 * p.cm - 5 * p.age + (p.sex === 'male' ? 5 : -161);
  const factor = 1.2 + 0.05 * Math.min(p.days.length, 6); // 1.25 .. 1.5
  const tdee = bmr * factor;
  const target = Math.max(1200, Math.round(tdee + (p.goal < kg ? -500 : p.goal > kg ? 300 : 0)));
  const protein = Math.round(1.8 * kg);
  const fat = Math.round((target * 0.25) / 9);
  const carbs = Math.max(0, Math.round((target - protein * 4 - fat * 9) / 4));
  const split: [string, number][] = [['Breakfast', 0.25], ['Lunch', 0.35], ['Snack', 0.1], ['Dinner', 0.3]];
  return { kcal: target, protein, carbs, fat, meals: split.map(([name, f]) => {
    const kcal = Math.round(target * f);
    const [food, base] = FOOD[name][seed % FOOD[name].length];
    const x = Math.max(0.5, Math.round((kcal / base) * 2) / 2); // portion in 0.5 steps
    return { name, kcal, food: x === 1 ? food : `${food} ×${x}` };
  }) };
}
