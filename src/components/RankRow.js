import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import PixelIcon from './PixelIcon';
import { Avatar, SegmentBar } from './ui';
import { colors, spacing, type } from '../theme';
import { formatNumber } from '../utils/format';

const PODIUM = { 1: colors.gold, 2: colors.silver, 3: colors.bronze };

export default function RankRow({ entry, leaderSteps }) {
  const podium = PODIUM[entry.position];
  return (
    <View style={styles.wrap}>
      <View style={styles.shadow} pointerEvents="none" />
      <View style={[styles.row, entry.isMe && styles.me]}>
        <View style={styles.position}>
          {entry.position === 1 ? (
            <PixelIcon name="crown" size={18} color={colors.gold} />
          ) : (
            <Text style={[type.scoreSm, { color: podium || colors.textFaint, fontSize: 10 }]}>
              {entry.position}
            </Text>
          )}
        </View>
        <Avatar avatar={entry.avatar} size={38} active={entry.isMe} />
        <View style={styles.info}>
          <Text style={[type.label, styles.name]} numberOfLines={1}>
            {entry.name}
            {entry.isMe ? '  ← VOS' : ''}
          </Text>
          <SegmentBar
            value={entry.steps}
            max={leaderSteps || 1}
            segments={14}
            height={10}
            color={entry.isMe ? colors.lime : podium || colors.cyan}
          />
        </View>
        <Text
          style={[
            type.scoreSm,
            styles.steps,
            { color: entry.isMe ? colors.lime : colors.text },
          ]}
        >
          {formatNumber(entry.steps)}
        </Text>
      </View>
    </View>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2.5),
    padding: spacing(3),
    backgroundColor: colors.panel,
    borderWidth: 3,
    borderColor: colors.border,
  },
  me: { borderColor: colors.lime, backgroundColor: colors.panelLit },
  position: { width: 22, alignItems: 'center' },
  info: { flex: 1, gap: spacing(1.5) },
  name: { color: colors.text, fontSize: 12 },
  steps: { fontSize: 10, minWidth: 54, textAlign: 'right' },
});
