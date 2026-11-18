import { Pressable, StyleSheet, Text, View } from 'react-native';
import { STEP_GOAL, stepKcal, useSteps } from '../lib/steps.ts';
import { useWatch } from '../lib/watch.ts';
import { c, font, sp } from '../theme.ts';
import { Bar, Btn, Card, Ionicons } from './ui.tsx';

export function Activity({ kg }: { kg: number }) {
  const { steps, ok } = useSteps();
  const w = useWatch();
  return (
    <>
      <Card>
        <View style={a.row}>
          <Ionicons name="footsteps" size={28} color={c.primary} />
          <Text style={a.big}>{steps.toLocaleString()}</Text>
          <Text style={a.sub}>/ {STEP_GOAL.toLocaleString()} steps</Text>
        </View>
        <Bar pct={(steps / STEP_GOAL) * 100} color={c.success} />
        <Text style={a.sub}>
          {ok === false ? 'Step counter unavailable. Allow motion permission (needs a dev build, not Expo Go).' : `~${stepKcal(steps, kg)} kcal burned walking`}
        </Text>
      </Card>
      <Card>
        <View style={a.row}>
          <Ionicons name="watch" size={28} color={c.primary} />
          <Text style={a.h2}>{w.name ?? 'Fitness watch'}</Text>
          {w.hr != null && <Text style={a.big}>{w.hr} bpm</Text>}
        </View>
        {w.msg !== '' && <Text style={a.sub}>{w.msg}</Text>}
        {w.found.map((d) => (
          <Pressable key={d.id} accessibilityRole="button" onPress={() => w.connect(d)} style={a.dev}>
            <Text style={a.item}>{d.name}</Text>
            <Text style={a.sub}>{d.rssi} dBm</Text>
          </Pressable>
        ))}
        <Btn ghost icon="bluetooth" label={w.name ? 'Scan again' : 'Connect watch'} onPress={w.scan} />
      </Card>
    </>
  );
}

const a = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: sp.sm },
  big: { color: c.fg, fontSize: 32, fontFamily: font.display },
  h2: { color: c.fg, fontSize: 22, fontFamily: font.displaySemi, flex: 1 },
  sub: { color: c.muted, fontSize: 14 },
  item: { color: c.fg, fontSize: 16, flex: 1 },
  dev: { flexDirection: 'row', alignItems: 'center', minHeight: 44, gap: sp.sm },
});
