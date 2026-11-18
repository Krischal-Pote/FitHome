import a from 'node:assert';
import { hhmm, parseRows, readSheet } from './mealsheet.ts';

a.equal(hhmm('8:30 pm'), '20:30');
a.equal(hhmm('12 am'), '00:00');
a.equal(hhmm('7'), '07:00');
a.equal(hhmm('25:00'), null);
const r = parseRows([['Time', 'Meal', 'Kcal', 'Food'], ['8:00', 'Breakfast', '350', 'Oats'], ['bad', 'Lunch', '500', 'Rice'], ['', '', '', '']]);
a.deepEqual(r, { meals: [{ name: 'Breakfast', food: 'Oats', kcal: 350, time: '08:00' }], skipped: 1 });
const csv = Buffer.from('Meal,Time,Food,Kcal\nLunch,13:00,"Rice, dal",550\n').toString('base64');
a.deepEqual(readSheet(csv).meals, [{ name: 'Lunch', food: 'Rice, dal', kcal: 550, time: '13:00' }]);
console.log('ok');
