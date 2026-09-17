import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, categoryColors, radius, spacing } from '../theme';
import { formatDistance, walkMinutes } from '../utils/format';

const ICONS = { cafe: '☕', comida: '🍽️', jugos: '🥤', helados: '🍦', otros: '📍' };

export default function PlaceRow({ place, onPress, active, compact }) {
  const tint = categoryColors[place.category] || colors.blue;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        active && { borderColor: colors.lime },
        compact && styles.compact,
        pressed && { opacity: 0.75 },
      ]}
    >
      <View style={[styles.icon, { borderColor: tint, backgroundColor: `${tint}22` }]}>
        <Text style={styles.iconText}>{ICONS[place.category] || '📍'}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {place.name}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {place.subtitle}
        </Text>
        <Text style={styles.meta}>
          {formatDistance(place.distance)}
          {place.distance != null ? ` · ${walkMinutes(place.distance)} min` : ''}
        </Text>
      </View>
      <Text style={styles.arrow}>→</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    paddingVertical: spacing(3),
    paddingHorizontal: spacing(3),
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.borderSoft,
  },
  compact: { paddingVertical: spacing(2.5) },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { fontSize: 20 },
  info: { flex: 1, gap: 2 },
  name: { color: colors.text, fontSize: 15, fontWeight: '800' },
  subtitle: { color: colors.textSoft, fontSize: 13 },
  meta: { color: colors.muted, fontSize: 12 },
  arrow: { color: colors.muted, fontSize: 18, fontWeight: '800' },
});
