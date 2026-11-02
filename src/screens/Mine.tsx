import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Btn, Card, Ionicons, Label, Title } from '../components/ui.tsx';
import { c, r, sp } from '../theme.ts';
import type { Custom } from '../types.ts';

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

const In = ({ label, value, set, kb = 'default', w }: { label: string; value: string; set: (v: string) => void; kb?: 'default' | 'number-pad'; w?: number }) => (
  <View style={w ? { width: w } : { flex: 1, minWidth: 100 }}>
    <Label>{label}</Label>
    <TextInput accessibilityLabel={label} style={x.input} keyboardType={kb} value={value} onChangeText={set} placeholderTextColor={c.muted} />
  </View>
);

const Del = ({ onPress, label }: { onPress: () => void; label: string }) => (
  <Pressable accessibilityRole="button" accessibilityLabel={`Delete ${label}`} onPress={onPress} hitSlop={12} style={x.del}>
    <Ionicons name="trash" size={20} color={c.danger} />
  </Pressable>
);

export function Mine({ custom, onSave }: { custom: Custom; onSave: (c: Custom) => void }) {
  const [en, setEn] = useState('');
  const [es, setEs] = useState('30');
  const [mn, setMn] = useState('');
  const [mf, setMf] = useState('');
  const [mk, setMk] = useState('');
  const [mt, setMt] = useState('08:00');
  const [ei, setEi] = useState<number | null>(null); // index being edited
  const [mi, setMi] = useState<number | null>(null);
  const okE = en.trim() !== '' && +es > 0;
  const okM = mn.trim() !== '' && mf.trim() !== '' && +mk > 0 && TIME.test(mt);
  return (
    <ScrollView contentContainerStyle={x.pad} keyboardShouldPersistTaps="handled">
      <Title>My plan</Title>
      <Text style={x.sub}>Add your own exercises and meals. Tap one to edit. Meals remind you daily at their time; workouts use your Plan reminder.</Text>

      <Label>My exercises</Label>
      {custom.ex.map((e, i) => (
        <Card key={i} style={[x.row, ei === i && x.editing]}>
          <Pressable accessibilityRole="button" accessibilityLabel={`Edit ${e.name}`} onPress={() => { setEi(i); setEn(e.name); setEs(String(e.secs)); }} style={x.grow}>
            <Text style={x.item}>{e.name}</Text><Text style={x.sub}>{e.secs}s</Text>
          </Pressable>
          <Del label={e.name} onPress={() => { setEi(null); onSave({ ...custom, ex: custom.ex.filter((_, j) => j !== i) }); }} />
        </Card>
      ))}
      <View style={x.form}>
        <In label="Exercise name" value={en} set={setEn} />
        <In label="Seconds" value={es} set={setEs} kb="number-pad" w={100} />
      </View>
      <Btn ghost icon={ei === null ? 'add' : 'checkmark'} label={ei === null ? 'Add exercise' : 'Save changes'} disabled={!okE} onPress={() => {
        const e = { name: en.trim(), secs: +es };
        onSave({ ...custom, ex: ei === null ? [...custom.ex, e] : custom.ex.map((v, j) => (j === ei ? e : v)) });
        setEi(null); setEn('');
      }} />

      <Label>My meals</Label>
      {custom.meals.map((m, i) => (
        <Card key={i} style={[x.row, mi === i && x.editing]}>
          <Pressable accessibilityRole="button" accessibilityLabel={`Edit ${m.name}`} onPress={() => { setMi(i); setMn(m.name); setMf(m.food); setMk(String(m.kcal)); setMt(m.time); }} style={x.grow}>
            <View style={{ flex: 1 }}><Text style={x.item}>{m.name} · {m.time}</Text><Text style={x.sub}>{m.food} · ~{m.kcal} kcal</Text></View>
          </Pressable>
          <Del label={m.name} onPress={() => { setMi(null); onSave({ ...custom, meals: custom.meals.filter((_, j) => j !== i) }); }} />
        </Card>
      ))}
      <View style={x.form}>
        <In label="Meal (e.g. Lunch)" value={mn} set={setMn} />
        <In label="Time (24h HH:MM)" value={mt} set={setMt} w={150} />
      </View>
      <View style={x.form}>
        <In label="Food" value={mf} set={setMf} />
        <In label="kcal" value={mk} set={setMk} kb="number-pad" w={100} />
      </View>
      <Btn ghost icon={mi === null ? 'add' : 'checkmark'} label={mi === null ? 'Add meal + reminder' : 'Save changes'} disabled={!okM} onPress={() => {
        const m = { name: mn.trim(), food: mf.trim(), kcal: +mk, time: mt };
        const meals = mi === null ? [...custom.meals, m] : custom.meals.map((v, j) => (j === mi ? m : v));
        onSave({ ...custom, meals: meals.sort((a, b) => a.time.localeCompare(b.time)) });
        setMi(null); setMn(''); setMf(''); setMk('');
      }} />
    </ScrollView>
  );
}

const x = StyleSheet.create({
  pad: { padding: sp.lg, gap: sp.sm },
  sub: { color: c.muted, fontSize: 14 },
  item: { color: c.fg, fontSize: 16, flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: sp.sm },
  form: { flexDirection: 'row', gap: sp.sm },
  grow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: sp.sm, minHeight: 44 },
  editing: { borderColor: c.primary },
  del: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  input: { backgroundColor: c.card, color: c.fg, borderRadius: r.md, padding: sp.md, fontSize: 16, minHeight: 52, borderWidth: 1, borderColor: c.border, marginTop: sp.xs },
});
