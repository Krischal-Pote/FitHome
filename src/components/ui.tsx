import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { c, font, r, sp } from '../theme.ts';

type IconName = keyof typeof Ionicons.glyphMap;
const tap = () => Haptics.selectionAsync().catch(() => {});

export const Btn = ({ label, onPress, ghost, disabled, icon }: { label: string; onPress: () => void; ghost?: boolean; disabled?: boolean; icon?: IconName }) => (
  <Pressable
    accessibilityRole="button"
    accessibilityState={{ disabled }}
    disabled={disabled}
    onPress={() => { tap(); onPress(); }}
    style={({ pressed }) => [s.btn, ghost && s.ghost, disabled && { opacity: 0.4 }, pressed && s.pressed]}
  >
    {icon && <Ionicons name={icon} size={20} color={ghost ? c.fg : c.onPrimary} />}
    <Text style={[s.btnT, ghost && { color: c.fg }]}>{label}</Text>
  </Pressable>
);

export const Chip = ({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) => (
  <Pressable
    accessibilityRole="button"
    accessibilityState={{ selected: on }}
    onPress={() => { tap(); onPress(); }}
    style={({ pressed }) => [s.chip, on && s.chipOn, pressed && s.pressed]}
  >
    <Text style={[s.chipT, on && { color: c.onPrimary }]}>{label}</Text>
  </Pressable>
);

export const Card = ({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) => <View style={[s.card, style]}>{children}</View>;

export const Title = ({ children }: { children: ReactNode }) => <Text accessibilityRole="header" style={s.title}>{children}</Text>;
export const Label = ({ children }: { children: ReactNode }) => <Text style={s.label}>{children}</Text>;

export const Bar = ({ pct, color = c.primary }: { pct: number; color?: string }) => (
  <View style={s.track}><View style={[s.fill, { width: `${Math.min(100, Math.max(0, pct))}%`, backgroundColor: color }]} /></View>
);

export { Ionicons };

export const s = StyleSheet.create({
  btn: { flexDirection: 'row', gap: sp.sm, backgroundColor: c.primary, borderRadius: r.md, minHeight: 52, paddingHorizontal: sp.md, alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch' },
  ghost: { backgroundColor: c.card, borderWidth: 1, borderColor: c.border },
  pressed: { transform: [{ scale: 0.97 }], opacity: 0.9 },
  btnT: { color: c.onPrimary, fontWeight: '700', fontSize: 16 },
  chip: { minHeight: 44, minWidth: 44, justifyContent: 'center', alignItems: 'center', backgroundColor: c.card, borderRadius: r.pill, paddingHorizontal: sp.md, borderWidth: 1, borderColor: c.border },
  chipOn: { backgroundColor: c.primary, borderColor: c.primary },
  chipT: { color: c.fg, fontWeight: '600', fontSize: 15, textTransform: 'capitalize' },
  card: { backgroundColor: c.card, borderRadius: r.lg, padding: sp.md, gap: sp.sm, borderWidth: 1, borderColor: c.border },
  title: { color: c.fg, fontSize: 34, fontFamily: font.display, letterSpacing: 0.3 },
  label: { color: c.muted, fontSize: 14, fontWeight: '600', marginTop: sp.sm },
  track: { height: 8, borderRadius: 4, backgroundColor: c.bg, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
});
