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
  cm?: number;
  age?: number;
  sex?: Sex;
};

export type Step = { name: string; secs: number; rest: boolean };
export type Workout = { steps: Step[]; kcal: number };
export type WeightEntry = { d: string; kg: number };
export type State = { profile: Profile | null; done: string[]; weights: WeightEntry[] };
