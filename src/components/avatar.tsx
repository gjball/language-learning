import { StyleSheet, Text, View } from 'react-native';

// Mid-tone colours that carry white text in both light and dark mode.
const COLORS = ['#D9485F', '#C2620C', '#2B8A3E', '#1570D1', '#7048E8', '#C2255C', '#0C8599'];

function colorFor(id: string): string {
  // FNV-1a, so similar IDs still spread across the colours.
  let hash = 2166136261;
  for (let i = 0; i < id.length; i++) hash = Math.imul(hash ^ id.charCodeAt(i), 16777619) >>> 0;
  return COLORS[hash % COLORS.length];
}

function initials(name: string): string {
  const words = name.trim().split(/\s+/);
  const letters = words.length > 1 ? words[0][0] + words[words.length - 1][0] : name.trim().slice(0, 2);
  return letters.toUpperCase();
}

/** A coloured circle with the person's initials; the colour is stable per ID. */
export function Avatar({ id, name, size = 32 }: { id: string; name: string; size?: number }) {
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: colorFor(id) },
      ]}>
      <Text style={[styles.initials, { fontSize: size * 0.4 }]}>{initials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#ffffff',
    fontWeight: 700,
  },
});
