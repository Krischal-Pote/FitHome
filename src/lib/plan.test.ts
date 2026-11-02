import a from 'node:assert';
import { buildCustom, buildWalkRun, buildWorkout, streak } from './plan.ts';

const w = buildWorkout('intermediate', 20);
a(w.steps.length > 4 && w.steps[0].name.startsWith('Warm'));
a(w.steps.reduce((s, x) => s + x.secs, 0) <= 20 * 60);
a(buildWorkout('beginner', 5).steps.length >= 2);
const t = new Date('2026-11-01T12:00:00Z');
a.equal(streak(['2026-11-01', '2026-10-31', '2026-10-30'], t), 3);
a.equal(streak(['2026-10-31'], t), 1); // yesterday only: alive
a.equal(streak(['2026-10-29'], t), 0); // missed a day: broken
a(buildWorkout('intermediate', 20, 100).kcal > buildWorkout('intermediate', 20, 50).kcal); // kcal scales with weight
const wr = buildWalkRun('beginner', 20);
a(wr.steps.some((x) => x.name === 'Run') && wr.steps.some((x) => x.rest));
a(wr.steps.reduce((n, x) => n + x.secs, 0) <= 20 * 60);
a(wr.kcal > 0 && buildWalkRun('beginner', 5).steps.length >= 1);
console.log('ok');
const cw = buildCustom([{ name: 'Dips', secs: 30 }, { name: 'Crunches', secs: 40 }]);
a.equal(cw.steps.length, 4);
a(cw.kcal > 0 && buildCustom([]).steps.length === 0);
