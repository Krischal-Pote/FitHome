import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Btn, Card, Title } from '../components/ui.tsx';
import { day } from '../lib/plan.ts';
import { STEP_GOAL, loadSteps } from '../lib/steps.ts';
import { c, font, r, sp } from '../theme.ts';
import type { WeightEntry } from '../types.ts';

export function Progress({ weights, start, onAdd }: { weights: WeightEntry[]; start: number; onAdd: (kg: number) => void }) {
  const [v, setV] = useState('');
  const [now] = useState(() => Date.now());
  const [hist, setHist] = useState<Record<string, number>>({});
  useEffect(() => { loadSteps().then(setHist); }, []);
  const days = Array.from({ length: 7 }, (_, k) => { const d = day(new Date(now - (6 - k) * 864e5)); return { d, n: hist[d] ?? 0 }; });
  const max = Math.max(STEP_GOAL, ...days.map((x) => x.n));
  const first = weights.length ? weights[0].kg : start;
  const cur = weights.length ? weights[weights.length - 1].kg : start;
  const diff = cur - first;
  return (
    <ScrollView contentContainerStyle={x.pad} keyboardShouldPersistTaps="handled">
      <Title>Progress</Title>
      <Card>
        <Text style={x.sub}>Since start</Text>
        <Text style={x.big}>{diff <= 0 ? '' : '+'}{diff.toFixed(1)} kg</Text>
        <Text style={x.sub}>Now {cur} kg</Text>
      </Card>
      <Card>
        <Text style={x.label}>Steps, last 7 days</Text>
        <View style={x.chart}>
          {days.map((e) => (
            <View key={e.d} style={x.col}>
              <Text style={x.sub}>{e.n ? (e.n / 1000).toFixed(1) + 'k' : ''}</Text>
              <View style={[x.barV, { height: Math.max(4, (e.n / max) * 100), backgroundColor: e.n >= STEP_GOAL ? c.success : c.primary }]} />
              <Text style={x.sub}>{e.d.slice(8)}</Text>
            </View>
          ))}
        </View>
      </Card>
      <Card>
        <Text style={x.label}>Log today&apos;s weight (kg)</Text>
        <View style={x.row}>
          <TextInput accessibilityLabel="Today's weight in kg" style={x.input} keyboardType="decimal-pad" value={v} onChangeText={setV} placeholder="e.g. 78.5" placeholderTextColor={c.muted} />
          <View style={{ width: 100 }}><Btn label="Log" disabled={!(+v > 0)} onPress={() => { onAdd(+v); setV(''); }} /></View>
        </View>
        {weights.slice(-7).reverse().map((e) => (
          <View key={e.d} style={x.rowB}><Text style={x.sub}>{e.d}</Text><Text style={x.item}>{e.kg} kg</Text></View>
        ))}
      </Card>
    </ScrollView>
  );
}

const x = StyleSheet.create({
  pad: { padding: sp.lg, gap: sp.md },
  big: { color: c.fg, fontSize: 56, fontFamily: font.display },
  sub: { color: c.muted, fontSize: 14 },
  item: { color: c.fg, fontSize: 16 },
  label: { color: c.muted, fontSize: 14, fontWeight: '600' },
  chart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 150 },
  col: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: sp.xs },
  barV: { width: 18, borderRadius: 4 },
  row: { flexDirection: 'row', gap: sp.sm, alignItems: 'center' },
  rowB: { flexDirection: 'row', justifyContent: 'space-between' },
  input: { flex: 1, backgroundColor: c.bg, color: c.fg, borderRadius: r.md, padding: sp.md, fontSize: 16, minHeight: 52, borderWidth: 1, borderColor: c.border },
});
