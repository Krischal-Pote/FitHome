import * as XLSX from 'xlsx';
import type { CustomMeal } from '../types.ts';

const COL: Record<keyof CustomMeal, RegExp> = {
  name: /^(meal|name|slot)$/i,
  time: /^(time|when|reminder)$/i,
  food: /^(food|items?|menu|description|dish)$/i,
  kcal: /^(kcal|calories?|cal)$/i,
};

// "8:00", "8", "8:30 pm" -> "HH:MM"; null if not a time.
export function hhmm(v: string): string | null {
  const m = /^(\d{1,2})(?::(\d{2}))?(?::\d{2})?\s*([ap]m)?$/i.exec(v.trim());
  if (!m) return null;
  let h = +m[1];
  const mi = +(m[2] ?? 0);
  if (m[3]) h = (h % 12) + (m[3].toLowerCase() === 'pm' ? 12 : 0);
  return h > 23 || mi > 59 ? null : `${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')}`;
}

// First row = headers (meal, time, food, kcal; any order). Bad rows are skipped and counted.
export function parseRows(rows: unknown[][]): { meals: CustomMeal[]; skipped: number } {
  const head = (rows[0] ?? []).map((h) => String(h ?? '').trim());
  const at = (k: keyof CustomMeal) => head.findIndex((h) => COL[k].test(h));
  const [iN, iT, iF, iK] = [at('name'), at('time'), at('food'), at('kcal')];
  if ([iN, iT, iF, iK].includes(-1)) throw new Error('Need columns: Meal, Time, Food, Kcal');
  const meals: CustomMeal[] = [];
  let skipped = 0;
  for (const r of rows.slice(1)) {
    if (r.every((v) => String(v ?? '').trim() === '')) continue;
    const time = hhmm(String(r[iT] ?? ''));
    const kcal = Math.round(parseFloat(String(r[iK] ?? '')));
    const name = String(r[iN] ?? '').trim();
    const food = String(r[iF] ?? '').trim();
    if (time && kcal > 0 && name && food) meals.push({ name, food, kcal, time });
    else skipped++;
  }
  return { meals, skipped };
}

// XLSX.read handles .xlsx, .xls and .csv alike.
export function readSheet(b64: string) {
  const wb = XLSX.read(b64, { type: 'base64' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  return parseRows(XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, raw: false, blankrows: false }));
}
