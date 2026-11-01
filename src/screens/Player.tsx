import * as Speech from 'expo-speech';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExercisePhoto } from '../components/ExercisePhoto.tsx';
import { Bar, Btn, Title } from '../components/ui.tsx';
import { c, font, sp } from '../theme.ts';
import type { Workout } from '../types.ts';

const say = (t: string) => { Speech.stop(); Speech.speak(t, { language: 'en-US', rate: 0.95 }); };

export function Player({ w, onExit }: { w: Workout; onExit: (finished: boolean) => void }) {
  const [pos, setPos] = useState({ i: 0, t: w.steps[0].secs });
  const [paused, setPaused] = useState(false);
  const [voice, setVoice] = useState(true);
  const [noTts, setNoTts] = useState(false);
  const { i, t } = pos;
  const step = w.steps[i];
  const finished = i >= w.steps.length;
  const next = w.steps[i + 1];
  const nextWork = w.steps.slice(i + 1).find((x) => !x.rest);
  const advance = () => setPos((q) => ({ i: q.i + 1, t: w.steps[q.i + 1]?.secs ?? 0 }));

  useEffect(() => {
    if (paused || finished) return;
    const id = setInterval(() => setPos((q) => (q.t > 1 ? { ...q, t: q.t - 1 } : { i: q.i + 1, t: w.steps[q.i + 1]?.secs ?? 0 })), 1000);
    return () => clearInterval(id);
  }, [paused, finished, w.steps]);

  // Voice-over: announce each step, count down the last 3 seconds, announce the finish.
  useEffect(() => {
    if (!voice) return;
    if (finished) return say('Workout complete. Great job!');
    if (step.rest) say(`${step.name}. ${nextWork ? `Next up, ${nextWork.name}.` : ''}`);
    else say(`${step.name}. ${step.secs} seconds. Go!`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, voice]);
  useEffect(() => {
    if (voice && !paused && !finished && t > 0 && t <= 3) say(String(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);
  useEffect(() => { // warn if the phone has no text-to-speech voices installed
    Speech.getAvailableVoicesAsync().then((v) => setNoTts(v.length === 0)).catch(() => setNoTts(true));
    return () => { Speech.stop(); };
  }, []);

  if (finished) return (
    <SafeAreaView style={[s.root, s.center]}>
      <Title>Workout done</Title>
      <Text style={s.sub}>~{w.kcal} kcal burned. Streak saved.</Text>
      <Btn label="Back home" icon="home" onPress={() => onExit(true)} />
    </SafeAreaView>
  );
  return (
    <SafeAreaView style={[s.root, s.center, step.rest && { backgroundColor: c.restBg }]}>
      <Text style={s.sub}>{i + 1} / {w.steps.length}</Text>
      <Title>{step.name}</Title>
      <ExercisePhoto name={step.rest ? nextWork?.name ?? '' : step.name} rest={step.rest} paused={paused} />
      <Text accessibilityLabel={`${t} seconds left`} style={[s.big, step.rest && { color: c.success }]}>{t}</Text>
      <View style={{ alignSelf: 'stretch' }}><Bar pct={(1 - t / step.secs) * 100} color={step.rest ? c.success : c.primary} /></View>
      {next && <Text style={s.sub}>Next: {next.name}</Text>}
      {noTts && voice && <Text style={[s.sub, { color: c.warn, textAlign: 'center' }]}>No voice found. Install Google Text-to-Speech in Android Settings, and raise media volume.</Text>}
      <Btn label={paused ? 'Resume' : 'Pause'} icon={paused ? 'play' : 'pause'} onPress={() => setPaused(!paused)} />
      <Btn ghost label={voice ? 'Voice on' : 'Voice off'} icon={voice ? 'volume-high' : 'volume-mute'} onPress={() => { Speech.stop(); setVoice(!voice); }} />
      <Btn ghost label="Skip" icon="play-skip-forward" onPress={advance} />
      <Btn ghost label="Quit" icon="close" onPress={() => onExit(false)} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: c.bg },
  center: { alignItems: 'center', justifyContent: 'center', gap: sp.md, padding: sp.lg },
  sub: { color: c.muted, fontSize: 16 },
  big: { color: c.primary, fontSize: 96, fontFamily: font.display, lineHeight: 104 },
});
