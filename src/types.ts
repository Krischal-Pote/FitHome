export type Level = 'beginner' | 'intermediate' | 'advanced';
export type Sex = 'male' | 'female';
export type Goal = 'lose' | 'maintain' | 'gain';

export type Profile = {
  kg: number;
  goal: number; // goal weight, kg
  minutes: number;
  level: Level;
  days: number[]; // expo weekday, 1 = Sunday
  time: string; // HH:MM
  // diet inputs; absent on profiles saved before diet planning existed
  cm?: number; // always stored in cm
  hUnit?: 'cm' | 'm' | 'ft'; // preferred display unit
  age?: number;
  sex?: Sex;
};

export type Step = { name: string; secs: number; rest: boolean };
export type Workout = { steps: Step[]; kcal: number };
export type WeightEntry = { d: string; kg: number };
export type CustomEx = { name: string; secs: number };
export type CustomMeal = { name: string; food: string; kcal: number; time: string }; // time HH:MM = daily reminder
export type Custom = { ex: CustomEx[]; meals: CustomMeal[] };
export type State = { profile: Profile | null; done: string[]; weights: WeightEntry[]; custom?: Custom };
