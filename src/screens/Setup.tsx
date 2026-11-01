import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Btn, Chip, Label, Title } from '../components/ui.tsx';
import { c, r, sp } from '../theme.ts';
import type { Level, Profile, Sex } from '../types.ts';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']; // index+1 = expo weekday (1 = Sunday)

const Field = ({ label, value, set, ph, kb = 'decimal-pad' }: { label: string; value: string; set: (v: string) => void; ph: string; kb?: 'decimal-pad' | 'number-pad' | 'default' }) => (
  <View style={{ flex: 1, minWidth: 100 }}>
    <Label>{label}</Label>
    <TextInput accessibilityLabel={label} style={x.input} keyboardType={kb} value={value} onChangeText={set} placeholder={ph} placeholderTextColor={c.muted} />
  </View>
);

export function Setup({ init, onSave }: { init: Profile | null; onSave: (p: Profile) => void }) {
  const [kg, setKg] = useState(String(init?.kg ?? ''));
  const [goal, setGoal] = useState(String(init?.goal ?? ''));
  const [cm, setCm] = useState(init?.cm ? String(init.cm) : '');
  const [age, setAge] = useState(init?.age ? String(init.age) : '');
  const [sex, setSex] = useState<Sex>(init?.sex ?? 'male');
  const [minutes, setMinutes] = useState(init?.minutes ?? 20);
  const [level, setLevel] = useState<Level>(init?.level ?? 'beginner');
  const [days, setDays] = useState(init?.days ?? [2, 3, 4, 5, 6]);
  const [time, setTime] = useState(init?.time ?? '18:30');
  const ok = +kg > 0 && +goal > 0 && +cm > 0 && +age > 0 && /^([01]\d|2[0-3]):[0-5]\d$/.test(time) && days.length > 0;
  const toggle = (d: number) => setDays(days.includes(d) ? days.filter((v) => v !== d) : [...days, d]);
  return (
    <ScrollView contentContainerStyle={x.pad} keyboardShouldPersistTaps="handled">
      <Title>{init ? 'Your plan' : 'Build your plan'}</Title>
      <Text style={x.sub}>No gym. Fits around work and college.</Text>
      <View style={x.row}>
        <Field label="Weight (kg)" value={kg} set={setKg} ph="80" />
        <Field label="Goal (kg)" value={goal} set={setGoal} ph="70" />
      </View>
      <View style={x.row}>
        <Field label="Height (cm)" value={cm} set={setCm} ph="175" kb="number-pad" />
        <Field label="Age" value={age} set={setAge} ph="25" kb="number-pad" />
      </View>
      <Label>Sex (for calorie estimate)</Label>
      <View style={x.row}>{(['male', 'female'] as const).map((v) => <Chip key={v} on={sex === v} label={v} onPress={() => setSex(v)} />)}</View>
      <Label>Minutes per day</Label>
      <View style={x.row}>{[10, 15, 20, 30, 45].map((m) => <Chip key={m} on={minutes === m} label={`${m}`} onPress={() => setMinutes(m)} />)}</View>
      <Label>Fitness level</Label>
      <View style={x.row}>{(['beginner', 'intermediate', 'advanced'] as const).map((l) => <Chip key={l} on={level === l} label={l} onPress={() => setLevel(l)} />)}</View>
      <Label>Workout days</Label>
      <View style={x.row}>{DAYS.map((d, i) => <Chip key={i} on={days.includes(i + 1)} label={d} onPress={() => toggle(i + 1)} />)}</View>
      <Field label="Reminder time (24h HH:MM)" value={time} set={setTime} ph="18:30" kb="default" />
      <Btn icon="checkmark" label="Save plan" disabled={!ok} onPress={() => onSave({ kg: +kg, goal: +goal, minutes, level, days, time, cm: +cm, age: +age, sex })} />
    </ScrollView>
  );
}

const x = StyleSheet.create({
  pad: { padding: sp.lg, gap: sp.sm },
  sub: { color: c.muted, fontSize: 15 },
  row: { flexDirection: 'row', gap: sp.sm, flexWrap: 'wrap' },
  input: { backgroundColor: c.card, color: c.fg, borderRadius: r.md, padding: sp.md, fontSize: 16, minHeight: 52, borderWidth: 1, borderColor: c.border, marginTop: sp.xs },
});
