import assert from 'node:assert';
import { dietPlan } from './diet.ts';

const p = { kg: 80, goal: 70, minutes: 20, level: 'beginner', days: [2, 3, 4, 5, 6], time: '18:30', cm: 175, age: 25, sex: 'male' } as const;
const d = dietPlan(p, 80)!;
assert(d.kcal > 1200 && d.kcal < 3000);
assert(Math.abs(d.protein * 4 + d.carbs * 4 + d.fat * 9 - d.kcal) < 15); // macros add up
assert(Math.abs(d.meals.reduce((s, m) => s + m.kcal, 0) - d.kcal) <= 2);
assert(dietPlan({ ...p, goal: 90 }, 80)!.kcal > d.kcal); // gain > lose
assert.equal(dietPlan({ ...p, cm: undefined }, 80), null); // old profile
assert(d.meals.every((m) => m.food.length > 0));
assert.notEqual(dietPlan(p, 80, 1)!.meals[0].food, d.meals[0].food); // rotates
console.log('ok');
