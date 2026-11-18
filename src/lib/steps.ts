import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pedometer } from 'expo-sensors';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { day } from './plan.ts';

export { stepKcal } from './units.ts';

const KEY = 'fithome:steps';
export const STEP_GOAL = 10000;

export const loadSteps = async (): Promise<Record<string, number>> => JSON.parse((await AsyncStorage.getItem(KEY)) ?? '{}');

export function useSteps() {
  const [steps, setSteps] = useState(0);
  const [ok, setOk] = useState<boolean | null>(null); // null = checking
  useEffect(() => {
    let sub: { remove: () => void } | undefined;
    let dead = false;
    (async () => {
      try {
        if (!(await Pedometer.isAvailableAsync()) || !(await Pedometer.requestPermissionsAsync()).granted) return setOk(false);
        const hist: Record<string, number> = JSON.parse((await AsyncStorage.getItem(KEY)) ?? '{}');
        let cur = { d: day(), base: hist[day()] ?? 0, off: 0 };
        if (Platform.OS === 'ios') {
          const t = new Date(); t.setHours(0, 0, 0, 0);
          cur.base = (await Pedometer.getStepCountAsync(t, new Date())).steps;
        }
        if (dead) return;
        setOk(true); setSteps(cur.base);
        sub = Pedometer.watchStepCount((r) => {
          const d = day();
          if (d !== cur.d) cur = { d, base: 0, off: r.steps }; // midnight rollover: new day starts at 0
          const n = cur.base + r.steps - cur.off;
          setSteps(n);
          hist[d] = n;
          AsyncStorage.setItem(KEY, JSON.stringify(hist));
        });
      } catch { setOk(false); }
    })();
    return () => { dead = true; sub?.remove(); };
  }, []);
  return { steps, ok };
}
