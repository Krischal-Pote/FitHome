import { BarlowCondensed_600SemiBold, BarlowCondensed_700Bold, useFonts } from '@expo-google-fonts/barlow-condensed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from './src/components/ui.tsx';
import { day } from './src/lib/plan.ts';
import { schedule } from './src/lib/notify.ts';
import { Diet } from './src/screens/Diet.tsx';
import { Player } from './src/screens/Player.tsx';
import { Progress } from './src/screens/Progress.tsx';
import { Setup } from './src/screens/Setup.tsx';
import { Today } from './src/screens/Today.tsx';
import { c } from './src/theme.ts';
import type { Profile, State, Workout } from './src/types.ts';

const KEY = 'fithome:v1';
const TABS = [
  ['today', 'Today', 'flame'], ['diet', 'Diet', 'nutrition'], ['progress', 'Progress', 'stats-chart'], ['plan', 'Plan', 'settings'],
] as const;
type Tab = (typeof TABS)[number][0];

export default function App() {
  return <SafeAreaProvider><Main /></SafeAreaProvider>;
}

function Main() {
  const [fontsOk] = useFonts({ BarlowCondensed_600SemiBold, BarlowCondensed_700Bold });
  const [s, setS] = useState<State | null>(null);
  const [tab, setTab] = useState<Tab>('today');
  const [run, setRun] = useState<Workout | null>(null);
  const [now] = useState(() => Date.now()); // render-pure clock for date-based UI

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => {
      const n: State = v ? JSON.parse(v) : { profile: null, done: [], weights: [] };
      setS(n);
      if (n.profile) schedule(n.profile, n.done.includes(day()));
    });
  }, []);
  const save = (n: State) => { setS(n); AsyncStorage.setItem(KEY, JSON.stringify(n)); };

  if (!s || !fontsOk) return <View style={st.root} />;
  const frame = (child: React.ReactNode) => <SafeAreaView style={st.root}><StatusBar style="light" />{child}</SafeAreaView>;
  const saveProfile = async (profile: Profile) => {
    await schedule(profile, s.done.includes(day()));
    save({ ...s, profile });
    setTab('today');
  };
  if (!s.profile) return frame(<Setup init={null} onSave={saveProfile} />);
  if (run) return <Player w={run} onExit={(finished) => {
    if (finished) {
      save({ ...s, done: [...new Set([...s.done, day()])] });
      schedule(s.profile!, true);
    }
    setRun(null);
  }} />;

  const p = s.profile;
  const weights = s.weights ?? [];
  const cur = weights.length ? weights[weights.length - 1].kg : p.kg;
  return frame(
    <>
      <View style={{ flex: 1 }}>
        {tab === 'today' && <Today s={s} p={p} cur={cur} now={now} onStart={setRun} goDiet={() => setTab('diet')} />}
        {tab === 'diet' && <Diet p={p} cur={cur} now={now} goPlan={() => setTab('plan')} />}
        {tab === 'progress' && <Progress weights={weights} start={p.kg} onAdd={(kg) => save({ ...s, weights: [...weights.filter((x) => x.d !== day()), { d: day(), kg }] })} />}
        {tab === 'plan' && <Setup init={p} onSave={saveProfile} />}
      </View>
      <View style={st.bar}>
        {TABS.map(([id, label, icon]) => (
          <Pressable key={id} accessibilityRole="tab" accessibilityState={{ selected: tab === id }} onPress={() => setTab(id)} style={({ pressed }) => [st.tab, pressed && { opacity: 0.6 }]}>
            <Ionicons name={tab === id ? icon : (`${icon}-outline` as typeof icon)} size={24} color={tab === id ? c.primary : c.muted} />
            <Text style={[st.tabT, tab === id && { color: c.primary }]}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </>,
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: c.bg },
  bar: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: c.border, backgroundColor: c.card },
  tab: { flex: 1, minHeight: 56, alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabT: { color: c.muted, fontSize: 12, fontWeight: '600' },
});
