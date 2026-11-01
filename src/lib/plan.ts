import type { Level, Workout, Step } from '../types.ts';

// Pure logic: workout builder, streak, calorie estimate. No RN imports so it can be tested with node.

const EX: Record<Level, [string, number][]> = {
  beginner: [
    ['March in place', 3.5], ['Squats', 5], ['Wall push-ups', 4], ['Glute bridges', 4],
    ['Standing knee raises', 4], ['Step jacks', 5], ['Plank (knees)', 3.5], ['Reverse lunges', 5],
  ],
  intermediate: [
    ['Jumping jacks', 8], ['Bodyweight squats', 6], ['Push-ups', 7], ['Mountain climbers', 9],
    ['Reverse lunges', 6], ['High knees', 9], ['Plank', 4], ['Burpees (no jump)', 9],
  ],
  advanced: [
    ['Burpees', 11], ['Jump squats', 10], ['Push-ups', 8], ['Mountain climbers', 10],
    ['Jump lunges', 10], ['High knees', 10], ['Plank shoulder taps', 6], ['Skater hops', 9],
  ],
};
const TIMING: Record<Level, [number, number]> = { beginner: [30, 30], intermediate: [40, 20], advanced: [45, 15] }; // work, rest secs

// Fill `minutes` with work/rest intervals, cycling through the level's exercises.
// 1 min warm-up is included when minutes >= 10.
export function buildWorkout(level: Level, minutes: number, kg = 70): Workout {
  const [work, rest] = TIMING[level];
  const list = EX[level];
  const warm = minutes >= 10 ? 60 : 0;
  const n = Math.max(1, Math.floor((minutes * 60 - warm) / (work + rest)));
  const steps: Step[] = [];
  if (warm) steps.push({ name: 'Warm-up: march + arm circles', secs: warm, rest: false });
  for (let i = 0; i < n; i++) {
    const [name] = list[i % list.length];
    steps.push({ name, secs: work, rest: false });
    steps.push({ name: 'Rest', secs: rest, rest: true });
  }
  const mets = list.reduce((s, e) => s + e[1], 0) / list.length;
  return { steps, kcal: kcal(mets, minutes, kg) };
}

export const kcal = (met: number, min: number, kg = 70) => Math.round(met * kg * (min / 60)); // standard MET formula

export const day = (d = new Date()) => d.toISOString().slice(0, 10);

// Consecutive-day streak ending today or yesterday (today not done yet doesn't break it).
export function streak(dates: string[], today = new Date()): number {
  const set = new Set(dates);
  const d = new Date(today);
  if (!set.has(day(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (set.has(day(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
