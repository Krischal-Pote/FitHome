import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { buildWorkout, day, streak } from './src/lib/plan.ts';
import { dietPlan } from './src/lib/diet.ts';
import type { Level, Profile, Sex, State, Workout } from './src/types.ts';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false,
  }),
});

const KEY = 'fithome:v1';
const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']; // index+1 = expo weekday (1 = Sunday)
const NUDGES = [
  'Your 10 minutes beat zero minutes. Let\'s go.',
  'Don\'t break the chain. Short session, big win.',
  'Coach says: show up today, results follow.',
  'Sweat now, thank yourself tonight.',
];

// Next 14 days as one-off reminders on the user's chosen days; today's is skipped once done.
// Re-run on app open and after each workout so the window keeps rolling.
async function schedule(p: Profile, doneToday: boolean) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  const { granted } = await Notifications.requestPermissionsAsync();
  if (!granted) return false;
  const [hour, minute] = p.time.split(':').map(Number);
  const now = new Date();
  const jobs = [];
  for (let i = 0; i < 14; i++) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, hour, minute);
    if (!p.days.includes(date.getDay() + 1) || date <= now || (i === 0 && doneToday)) continue;
    jobs.push(Notifications.scheduleNotificationAsync({
      content: { title: 'FitHome workout time 🔥', body: NUDGES[i % NUDGES.length] },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
    }));
  }
  await Promise.all(jobs);
  return true;
}

export default function App() {
  return <SafeAreaProvider><Main /></SafeAreaProvider>;
}

function Main() {
  const [s, setS] = useState<State | null>(null);
  const [screen, setScreen] = useState('home');
  const [run, setRun] = useState<Workout | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => {
      const n: State = v ? JSON.parse(v) : { profile: null, done: [], weights: [] };
      setS(n);
      if (n.profile) schedule(n.profile, n.done.includes(day()));
    });
  }, []);
  const save = (n: State) => { setS(n); AsyncStorage.setItem(KEY, JSON.stringify(n)); };

  if (!s) return null;
  if (!s.profile || screen === 'setup')
    return <Setup init={s.profile} onSave={async (profile: Profile) => {
      await schedule(profile, s.done.includes(day()));
      save({ ...s, profile });
      setScreen('home');
    }} />;
  if (run) return <Player w={run} onExit={(finished: boolean) => {
    if (finished) {
      save({ ...s, done: [...new Set([...s.done, day()])] });
      schedule(s.profile!, true);
    }
    setRun(null);
  }} />;

  const p = s.profile;
  const weights = s.weights ?? [];
  const cur = weights.length ? weights[weights.length - 1].kg : p.kg;
  const w = buildWorkout(p.level, p.minutes, cur);
  const doneToday = s.done.includes(day());
  const left = cur - p.goal;
  const diet = dietPlan(p, cur);
  return (
    <SafeAreaView style={st.root}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={st.pad}>
        <Text style={st.h1}>🔥 {streak(s.done)} day streak</Text>
        <Text style={st.sub}>{left > 0 ? `${left.toFixed(1)} kg to goal` : 'Goal reached — maintain!'}</Text>
        <View style={st.card}>
          <Text style={st.h2}>Today: {p.minutes} min · ~{w.kcal} kcal</Text>
          {w.steps.filter((x) => !x.rest).map((x, i) => (
            <Text key={i} style={st.item}>• {x.name} — {x.secs}s</Text>
          ))}
          <Btn label={doneToday ? 'Done today ✓ (go again)' : 'Start workout'} onPress={() => setRun(w)} />
        </View>
        {diet ? (
          <View style={st.card}>
            <Text style={st.h2}>Diet: ~{diet.kcal} kcal/day</Text>
            <Text style={st.sub}>P {diet.protein}g · C {diet.carbs}g · F {diet.fat}g</Text>
            {diet.meals.map((m) => <Text key={m.name} style={st.item}>• {m.name} — ~{m.kcal} kcal</Text>)}
            <Text style={st.sub}>Estimate only. Not medical advice.</Text>
          </View>
        ) : (
          <Btn ghost label="Add height, age & sex for a diet plan" onPress={() => setScreen('setup')} />
        )}
        <WeightLog weights={weights} start={p.kg} onAdd={(kg) => save({ ...s, weights: [...weights.filter((x) => x.d !== day()), { d: day(), kg }] })} />
        <Btn ghost label="Edit schedule & goals" onPress={() => setScreen('setup')} />
      </ScrollView>
    </SafeAreaView>
  );
}

function WeightLog({ weights, start, onAdd }: { weights: State['weights']; start: number; onAdd: (kg: number) => void }) {
  const [v, setV] = useState('');
  const first = weights.length ? weights[0].kg : start;
  const cur = weights.length ? weights[weights.length - 1].kg : start;
  const diff = cur - first;
  return (
    <View style={st.card}>
      <Text style={st.h2}>Progress: {diff <= 0 ? '' : '+'}{diff.toFixed(1)} kg since start</Text>
      {weights.slice(-5).map((x) => <Text key={x.d} style={st.item}>{x.d} — {x.kg} kg</Text>)}
      <View style={st.row}>
        <TextInput style={st.input} keyboardType="decimal-pad" value={v} onChangeText={setV} placeholder="Today's weight (kg)" placeholderTextColor="#777" />
        <Btn label="Log" disabled={!(+v > 0)} onPress={() => { onAdd(+v); setV(''); }} />
      </View>
    </View>
  );
}

function Setup({ init, onSave }: { init: Profile | null; onSave: (p: Profile) => void }) {
  const [kg, setKg] = useState(String(init?.kg ?? ''));
  const [goal, setGoal] = useState(String(init?.goal ?? ''));
  const [minutes, setMinutes] = useState(init?.minutes ?? 20);
  const [level, setLevel] = useState<Level>(init?.level ?? 'beginner');
  const [cm, setCm] = useState(init?.cm ? String(init.cm) : '');
  const [age, setAge] = useState(init?.age ? String(init.age) : '');
  const [sex, setSex] = useState<Sex>(init?.sex ?? 'male');
  const [days, setDays] = useState(init?.days ?? [2, 3, 4, 5, 6]);
  const [time, setTime] = useState(init?.time ?? '18:30');
  const ok = +kg > 0 && +goal > 0 && +cm > 0 && +age > 0 && /^([01]\d|2[0-3]):[0-5]\d$/.test(time) && days.length > 0;
  const toggle = (d: number) => setDays(days.includes(d) ? days.filter((x) => x !== d) : [...days, d]);
  return (
    <SafeAreaView style={st.root}>
      <ScrollView contentContainerStyle={st.pad} keyboardShouldPersistTaps="handled">
        <Text style={st.h1}>Build your plan</Text>
        <Text style={st.sub}>No gym. Fits around work and college.</Text>
        <Text style={st.label}>Current / goal weight (kg)</Text>
        <View style={st.row}>
          <TextInput style={st.input} keyboardType="decimal-pad" value={kg} onChangeText={setKg} placeholder="80" placeholderTextColor="#777" />
          <TextInput style={st.input} keyboardType="decimal-pad" value={goal} onChangeText={setGoal} placeholder="70" placeholderTextColor="#777" />
        </View>
        <Text style={st.label}>Height (cm) / age / sex (for diet plan)</Text>
        <View style={st.row}>
          <TextInput style={st.input} keyboardType="number-pad" value={cm} onChangeText={setCm} placeholder="175" placeholderTextColor="#777" />
          <TextInput style={st.input} keyboardType="number-pad" value={age} onChangeText={setAge} placeholder="25" placeholderTextColor="#777" />
        </View>
        <View style={st.row}>
          {(['male', 'female'] as const).map((x) => <Chip key={x} on={sex === x} label={x} onPress={() => setSex(x)} />)}
        </View>
        <Text style={st.label}>Minutes per day</Text>
        <View style={st.row}>
          {[10, 15, 20, 30, 45].map((m) => <Chip key={m} on={minutes === m} label={`${m}`} onPress={() => setMinutes(m)} />)}
        </View>
        <Text style={st.label}>Fitness level</Text>
        <View style={st.row}>
          {(['beginner', 'intermediate', 'advanced'] as const).map((l) => <Chip key={l} on={level === l} label={l} onPress={() => setLevel(l)} />)}
        </View>
        <Text style={st.label}>Workout days</Text>
        <View style={st.row}>
          {DAYS.map((d, i) => <Chip key={i} on={days.includes(i + 1)} label={d} onPress={() => toggle(i + 1)} />)}
        </View>
        <Text style={st.label}>Reminder time (24h HH:MM)</Text>
        <TextInput style={st.input} value={time} onChangeText={setTime} placeholder="18:30" placeholderTextColor="#777" />
        <Btn label="Save & remind me" disabled={!ok} onPress={() => onSave({ kg: +kg, goal: +goal, minutes, level, days, time, cm: +cm, age: +age, sex })} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Player({ w, onExit }: { w: Workout; onExit: (finished: boolean) => void }) {
  const [i, setI] = useState(0);
  const [t, setT] = useState(w.steps[0].secs);
  const [paused, setPaused] = useState(false);
  const step = w.steps[i];
  const finished = i >= w.steps.length;

  useEffect(() => {
    if (paused || finished) return;
    const id = setInterval(() => setT((v) => v - 1), 1000);
    return () => clearInterval(id);
  }, [paused, finished]);

  useEffect(() => {
    if (t > 0 || finished) return;
    const n = i + 1;
    setI(n);
    if (n < w.steps.length) setT(w.steps[n].secs);
  }, [t]);

  if (finished) return (
    <SafeAreaView style={[st.root, st.center]}>
      <Text style={st.h1}>Workout done! 💪</Text>
      <Text style={st.sub}>~{w.kcal} kcal burned. Streak saved.</Text>
      <Btn label="Back home" onPress={() => onExit(true)} />
    </SafeAreaView>
  );
  const next = w.steps[i + 1];
  return (
    <SafeAreaView style={[st.root, st.center, step.rest && { backgroundColor: '#0b3d2e' }]}>
      <Text style={st.sub}>{i + 1} / {w.steps.length}</Text>
      <Text style={st.h1}>{step.name}</Text>
      <Text style={st.big}>{t}</Text>
      {next && <Text style={st.sub}>Next: {next.name}</Text>}
      <Btn label={paused ? 'Resume' : 'Pause'} onPress={() => setPaused(!paused)} />
      <Btn ghost label="Skip" onPress={() => setT(0)} />
      <Btn ghost label="Quit" onPress={() => onExit(false)} />
    </SafeAreaView>
  );
}

const Btn = ({ label, onPress, ghost, disabled }: { label: string; onPress: () => void; ghost?: boolean; disabled?: boolean }) => (
  <Pressable disabled={disabled} onPress={onPress} style={[st.btn, ghost && st.ghost, disabled && { opacity: 0.4 }]}>
    <Text style={st.btnT}>{label}</Text>
  </Pressable>
);
const Chip = ({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) => (
  <Pressable onPress={onPress} style={[st.chip, on && st.chipOn]}>
    <Text style={st.btnT}>{label}</Text>
  </Pressable>
);

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#111' },
  pad: { padding: 20, gap: 12 },
  center: { alignItems: 'center', justifyContent: 'center', gap: 14, padding: 20 },
  h1: { color: '#fff', fontSize: 28, fontWeight: '800' },
  h2: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 6 },
  sub: { color: '#aaa', fontSize: 15 },
  label: { color: '#ddd', marginTop: 10, fontWeight: '600' },
  item: { color: '#ddd', fontSize: 15, paddingVertical: 2 },
  big: { color: '#ff6a3d', fontSize: 120, fontWeight: '900' },
  card: { backgroundColor: '#1c1c1e', borderRadius: 16, padding: 16, gap: 4 },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  input: { flex: 1, minWidth: 90, backgroundColor: '#1c1c1e', color: '#fff', borderRadius: 10, padding: 12, fontSize: 16 },
  chip: { backgroundColor: '#1c1c1e', borderRadius: 20, paddingVertical: 10, paddingHorizontal: 16 },
  chipOn: { backgroundColor: '#ff6a3d' },
  btn: { backgroundColor: '#ff6a3d', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 12, alignSelf: 'stretch' },
  ghost: { backgroundColor: '#2a2a2c' },
  btnT: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
