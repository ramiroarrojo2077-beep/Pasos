import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import PixelIcon from './PixelIcon';
import { CATEGORY_SPRITE } from './sprites';
import { colors, categoryColors, spacing, type } from '../theme';
import { formatDistance, walkMinutes } from '../utils/format';

export default function PlaceRow({ place, onPress, active, compact }) {
  const tint = categoryColors[place.category] || colors.cyan;
  const minutes = walkMinutes(place.distance);
  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      {({ pressed }) => (
        <View style={styles.wrap}>
          <View style={[styles.shadow, pressed && styles.shadowPressed]} pointerEvents="none" />
          <View
            style={[
              styles.row,
              active && { borderColor: colors.lime },
              compact && styles.compact,
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.icon, { borderColor: tint }]}>
              <PixelIcon name={CATEGORY_SPRITE[place.category] || 'pin'} size={22} color={tint} />
            </View>
            <View style={styles.info}>
              <Text style={[type.label, styles.name]} numberOfLines={1}>
                {place.name}
              </Text>
              <Text style={[type.small, styles.subtitle]} numberOfLines={1}>
                {place.subtitle}
              </Text>
              <View style={styles.metaRow}>
                <PixelIcon name="pin" size={10} color={colors.textFaint} />
                <Text style={[type.tiny, styles.meta]}>{formatDistance(place.distance)}</Text>
                {minutes ? (
                  <>
                    <PixelIcon name="shoe" size={10} color={colors.textFaint} />
                    <Text style={[type.tiny, styles.meta]}>{minutes} MIN</Text>
                  </>
                ) : null}
              </View>
            </View>
            <PixelIcon name="chevron" size={14} color={colors.borderLit} />
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative' },
  shadow: {
    position: 'absolute',
    left: 4,
    top: 4,
    right: -4,
    bottom: -4,
    backgroundColor: colors.shadow,
  },
  shadowPressed: { left: 1, top: 1, right: -1, bottom: -1 },
  pressed: { transform: [{ translateX: 3 }, { translateY: 3 }] },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    paddingVertical: spacing(3),
    paddingHorizontal: spacing(3),
    backgroundColor: colors.panel,
    borderWidth: 3,
    borderColor: colors.border,
  },
  compact: { paddingVertical: spacing(2.5) },
  icon: {
    width: 42,
    height: 42,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.panelAlt,
  },
  info: { flex: 1, gap: 3 },
  name: { color: colors.text },
  subtitle: { color: colors.textDim },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(1.5), marginTop: 2 },
  meta: { color: colors.textFaint, letterSpacing: 0.6, marginRight: spacing(1) },
});
