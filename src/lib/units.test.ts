import a from 'node:assert';
import { fromCm, toCm } from './units.ts';

a.equal(Math.round(toCm('m', 1.75)), 175);
a.equal(Math.round(toCm('ft', 5, 9)), 175);
a.deepEqual(fromCm('ft', 175.26), ['5', '9']);
a.deepEqual(fromCm('m', 175), ['1.75', '']);
console.log('ok');
