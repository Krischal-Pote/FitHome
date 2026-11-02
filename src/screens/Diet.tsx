import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Bar, Btn, Card, Ionicons, Title } from '../components/ui.tsx';
import { dietPlan } from '../lib/diet.ts';
import { c, font, sp } from '../theme.ts';
import type { CustomMeal, Profile } from '../types.ts';

const ICON = { Breakfast: 'sunny', Lunch: 'restaurant', Snack: 'cafe', Dinner: 'moon' } as const;

export function Diet({ p, meals, cur, now, goPlan }: { p: Profile; meals: CustomMeal[]; cur: number; now: number; goPlan: () => void }) {
  const d = dietPlan(p, cur, Math.floor(now / 864e5)); // rotates daily
  if (!d) return (
    <View style={[x.pad, { justifyContent: 'center', flex: 1 }]}>
      <Title>Your diet plan</Title>
      <Text style={x.sub}>Add your height, age and sex and we will build a daily calorie and meal plan.</Text>
      <Btn icon="create" label="Add details" onPress={goPlan} />
    </View>
  );
  const goal = p.goal < cur ? 'Lose weight' : p.goal > cur ? 'Gain weight' : 'Maintain';
  const macros = [
    ['Protein', d.protein, 4, c.primary], ['Carbs', d.carbs, 4, c.warn], ['Fat', d.fat, 9, c.success],
  ] as const;
  return (
    <ScrollView contentContainerStyle={x.pad}>
      <Title>Your diet plan</Title>
      <Card>
        <Text style={x.sub}>{goal} · daily target</Text>
        <Text style={x.big}>{d.kcal} <Text style={x.sub}>kcal</Text></Text>
        {macros.map(([n, g, k, col]) => (
          <View key={n} style={{ gap: 4 }}>
            <View style={x.rowB}><Text style={x.item}>{n}</Text><Text style={x.sub}>{g} g</Text></View>
            <Bar pct={((g * k) / d.kcal) * 100} color={col} />
          </View>
        ))}
      </Card>
      {d.meals.map((m) => (
        <Card key={m.name}>
          <View style={x.rowB}>
            <View style={x.row}><Ionicons name={ICON[m.name as keyof typeof ICON]} size={20} color={c.primary} /><Text style={x.h2}>{m.name}</Text></View>
            <Text style={x.sub}>~{m.kcal} kcal</Text>
          </View>
          <Text style={x.item}>{m.food}</Text>
        </Card>
      ))}
      {meals.length > 0 && <Title>My meals</Title>}
      {meals.map((m, i) => (
        <Card key={i}>
          <View style={x.rowB}><Text style={x.h2}>{m.name} · {m.time}</Text><Text style={x.sub}>~{m.kcal} kcal</Text></View>
          <Text style={x.item}>{m.food}</Text>
        </Card>
      ))}
      <Text style={x.sub}>Estimate only. Not medical advice. Menu changes daily.</Text>
    </ScrollView>
  );
}

const x = StyleSheet.create({
  pad: { padding: sp.lg, gap: sp.md },
  h2: { color: c.fg, fontSize: 22, fontFamily: font.displaySemi },
  big: { color: c.fg, fontSize: 56, fontFamily: font.display },
  sub: { color: c.muted, fontSize: 14 },
  item: { color: c.fg, fontSize: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: sp.sm },
  rowB: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
