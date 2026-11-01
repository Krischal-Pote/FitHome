import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { PHOTO } from '../lib/photos.ts';
import { c, r } from '../theme.ts';
import { Ionicons } from './ui.tsx';

// Flips between the two photo frames to mimic a GIF; icon when no photo exists for the exercise.
export function ExercisePhoto({ name, rest, paused }: { name: string; rest: boolean; paused: boolean }) {
  const frames = PHOTO[name];
  const [f, setF] = useState(0);
  useEffect(() => {
    if (!frames || paused) return;
    const id = setInterval(() => setF((v) => 1 - v), 700);
    return () => clearInterval(id);
  }, [frames, paused]);
  return (
    <View style={s.box}>
      {frames
        ? <Image accessibilityLabel={`${name} demonstration`} source={frames[f]} style={s.img} resizeMode="contain" />
        : <Ionicons name={rest ? 'walk' : 'fitness'} size={72} color={c.muted} />}
    </View>
  );
}

const s = StyleSheet.create({
  box: { width: '100%', height: 220, borderRadius: r.lg, backgroundColor: c.card, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  img: { width: '100%', height: '100%' },
});
