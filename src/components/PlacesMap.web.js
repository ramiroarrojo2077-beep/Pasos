import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, categoryColors, radius } from '../theme';

const ICONS = { cafe: '☕', comida: '🍽️', jugos: '🥤', helados: '🍦', otros: '📍' };
const SPAN = 0.012; // ~1.3 km de lado

/**
 * En web no hay react-native-maps, así que dibujamos un mini-mapa pixel
 * con la grilla de calles y los lugares ubicados por coordenadas.
 */
export default function PlacesMap({ center, places, selectedId, onSelect, style }) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  const pins = useMemo(() => {
    if (!center || !size.width) return [];
    return places
      .map((p) => {
        const x = 0.5 + (p.longitude - center.longitude) / SPAN;
        const y = 0.5 - (p.latitude - center.latitude) / SPAN;
        if (x < 0.03 || x > 0.97 || y < 0.03 || y > 0.97) return null;
        return { ...p, left: x * size.width, top: y * size.height };
      })
      .filter(Boolean);
  }, [center, places, size]);

  const lines = [];
  for (let i = 1; i < 8; i += 1) lines.push(i / 8);

  return (
    <View
      style={[styles.map, style]}
      onLayout={(e) => setSize(e.nativeEvent.layout)}
    >
      {lines.map((f) => (
        <View key={`h${f}`} style={[styles.road, { top: f * size.height, width: '100%', height: 4 }]} />
      ))}
      {lines.map((f) => (
        <View key={`v${f}`} style={[styles.road, { left: f * size.width, height: '100%', width: 4 }]} />
      ))}
      <View style={[styles.park, { left: '12%', top: '15%' }]} />
      <View style={[styles.park, { left: '62%', top: '58%' }]} />
      {size.width > 0 ? (
        <View
          style={[
            styles.me,
            { left: size.width / 2 - 9, top: size.height / 2 - 9 },
          ]}
        />
      ) : null}
      {pins.map((p) => {
        const tint = categoryColors[p.category] || colors.blue;
        const active = p.id === selectedId;
        return (
          <Pressable
            key={p.id}
            onPress={() => onSelect?.(p)}
            style={[styles.pin, { left: p.left - 17, top: p.top - 17, backgroundColor: tint, borderColor: active ? colors.lime : '#0A1020' }]}
          >
            <Text style={styles.pinIcon}>{ICONS[p.category] || '📍'}</Text>
          </Pressable>
        );
      })}
      <View style={styles.hint}>
        <Text style={styles.hintText}>Mapa pixel · versión web</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    backgroundColor: '#0C1A33',
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  road: { position: 'absolute', backgroundColor: '#17325C' },
  park: {
    position: 'absolute',
    width: 70,
    height: 54,
    backgroundColor: '#164B2B',
    borderRadius: 4,
  },
  me: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.blue,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  pin: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinIcon: { fontSize: 16 },
  hint: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(7,12,24,0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  hintText: { color: colors.muted, fontSize: 11 },
});
