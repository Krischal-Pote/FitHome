import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Bar, Btn, Card, Chip, Ionicons, Title } from '../components/ui.tsx';
import { dietPlan } from '../lib/diet.ts';
import { buildCustom, buildWalkRun, buildWorkout, day, streak } from '../lib/plan.ts';
import { c, font, sp } from '../theme.ts';
import type { CustomEx, Profile, State, Workout } from '../types.ts';

const L = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function Today({ s, p, custom, cur, now, onStart, goDiet }: { s: State; p: Profile; custom: CustomEx[]; cur: number; now: number; onStart: (w: Workout) => void; goDiet: () => void }) {
  const [mode, setMode] = useState<'strength' | 'cardio' | 'mine'>('strength');
  const w = mode === 'mine' ? buildCustom(custom, cur) : (mode === 'cardio' ? buildWalkRun : buildWorkout)(p.level, p.minutes, cur);
  const doneToday = s.done.includes(day());
  const left = cur - p.goal;
  const diet = dietPlan(p, cur);
  const week = Array.from({ length: 7 }, (_, k) => new Date(now - (6 - k) * 864e5));
  return (
    <ScrollView contentContainerStyle={t.pad}>
      <View style={t.hero}>
        <Ionicons name="flame" size={44} color={c.primary} />
        <View>
          <Title>{streak(s.done)} day streak</Title>
          <Text style={t.sub}>{left > 0 ? `${left.toFixed(1)} kg to goal` : 'Goal reached. Maintain!'}</Text>
        </View>
      </View>
      <Card>
        <View style={t.week}>
          {week.map((d) => (
            <View key={d.toISOString()} style={t.dayCol}>
              <View style={[t.dot, s.done.includes(day(d)) && { backgroundColor: c.success, borderColor: c.success }]}>
                {s.done.includes(day(d)) && <Ionicons name="checkmark" size={16} color={c.onPrimary} />}
              </View>
              <Text style={t.sub}>{L[d.getDay()]}</Text>
            </View>
          ))}
        </View>
      </Card>
      <Card>
        <View style={t.week}>
          <Chip on={mode === 'strength'} label="Bodyweight" onPress={() => setMode('strength')} />
          <Chip on={mode === 'cardio'} label="Walk & run" onPress={() => setMode('cardio')} />
          {custom.length > 0 && <Chip on={mode === 'mine'} label="Mine" onPress={() => setMode('mine')} />}
        </View>
        <Text style={t.h2}>Today&apos;s workout</Text>
        <Text style={t.sub}>{mode === 'mine' ? Math.round(w.steps.reduce((n, x) => n + x.secs, 0) / 60) : p.minutes} min · ~{w.kcal} kcal · {mode === 'mine' ? 'custom' : p.level}</Text>
        {(mode === 'cardio' ? w.steps : w.steps.filter((x) => !x.rest)).map((x, i) => (
          <View key={i} style={t.row}><Ionicons name={mode === 'cardio' ? (x.rest ? 'walk' : 'speedometer') : 'barbell'} size={16} color={c.muted} /><Text style={t.item}>{x.name}</Text><Text style={t.sub}>{x.secs}s</Text></View>
        ))}
        <Btn icon={doneToday ? 'refresh' : 'play'} label={doneToday ? 'Done today. Go again' : 'Start workout'} onPress={() => onStart(w)} />
      </Card>
      {diet ? (
        <Card>
          <Text style={t.h2}>Eat today: ~{diet.kcal} kcal</Text>
          <Bar pct={100} color={c.success} />
          <Text style={t.sub}>Protein {diet.protein}g · Carbs {diet.carbs}g · Fat {diet.fat}g</Text>
          <Btn ghost icon="nutrition" label="See meal plan" onPress={goDiet} />
        </Card>
      ) : (
        <Btn ghost icon="nutrition" label="Add height, age & sex for a diet plan" onPress={goDiet} />
      )}
    </ScrollView>
  );
}

const t = StyleSheet.create({
  pad: { padding: sp.lg, gap: sp.md },
  hero: { flexDirection: 'row', alignItems: 'center', gap: sp.md },
  h2: { color: c.fg, fontSize: 26, fontFamily: font.displaySemi },
  sub: { color: c.muted, fontSize: 14 },
  item: { color: c.fg, fontSize: 16, flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: sp.sm, minHeight: 28 },
  week: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCol: { alignItems: 'center', gap: sp.xs },
  dot: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: c.border, alignItems: 'center', justifyContent: 'center' },
});
