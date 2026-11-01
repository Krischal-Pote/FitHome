// Static requires so Metro bundles them. Photos: free-exercise-db (public domain). Exercises not listed show an icon.
const F = {
  Bodyweight_Squat: [require('../../assets/exercises/Bodyweight_Squat-0.jpg'), require('../../assets/exercises/Bodyweight_Squat-1.jpg')],
  Butt_Lift_Bridge: [require('../../assets/exercises/Butt_Lift_Bridge-0.jpg'), require('../../assets/exercises/Butt_Lift_Bridge-1.jpg')],
  Crossover_Reverse_Lunge: [require('../../assets/exercises/Crossover_Reverse_Lunge-0.jpg'), require('../../assets/exercises/Crossover_Reverse_Lunge-1.jpg')],
  Freehand_Jump_Squat: [require('../../assets/exercises/Freehand_Jump_Squat-0.jpg'), require('../../assets/exercises/Freehand_Jump_Squat-1.jpg')],
  Incline_Push_Up: [require('../../assets/exercises/Incline_Push-Up-0.jpg'), require('../../assets/exercises/Incline_Push-Up-1.jpg')],
  Lateral_Bound: [require('../../assets/exercises/Lateral_Bound-0.jpg'), require('../../assets/exercises/Lateral_Bound-1.jpg')],
  Mountain_Climbers: [require('../../assets/exercises/Mountain_Climbers-0.jpg'), require('../../assets/exercises/Mountain_Climbers-1.jpg')],
  Plank: [require('../../assets/exercises/Plank-0.jpg'), require('../../assets/exercises/Plank-1.jpg')],
  Pushups: [require('../../assets/exercises/Pushups-0.jpg'), require('../../assets/exercises/Pushups-1.jpg')],
  Split_Jump: [require('../../assets/exercises/Split_Jump-0.jpg'), require('../../assets/exercises/Split_Jump-1.jpg')],
  Step_up_with_Knee_Raise: [require('../../assets/exercises/Step-up_with_Knee_Raise-0.jpg'), require('../../assets/exercises/Step-up_with_Knee_Raise-1.jpg')],
};

export const PHOTO: Record<string, number[]> = {
  'Squats': F.Bodyweight_Squat,
  'Bodyweight squats': F.Bodyweight_Squat,
  'Jump squats': F.Freehand_Jump_Squat,
  'Push-ups': F.Pushups,
  'Wall push-ups': F.Incline_Push_Up,
  'Glute bridges': F.Butt_Lift_Bridge,
  'Plank': F.Plank,
  'Plank (knees)': F.Plank,
  'Plank shoulder taps': F.Plank,
  'Reverse lunges': F.Crossover_Reverse_Lunge,
  'Jump lunges': F.Split_Jump,
  'Mountain climbers': F.Mountain_Climbers,
  'Standing knee raises': F.Step_up_with_Knee_Raise,
  'Skater hops': F.Lateral_Bound,
};
