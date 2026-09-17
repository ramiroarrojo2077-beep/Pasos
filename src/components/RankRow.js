import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { formatNumber } from '../utils/format';
import { Avatar, ProgressBar } from './ui';

const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function RankRow({ entry, leaderSteps }) {
  const medal = MEDALS[entry.position];
  return (
    <View style={[styles.row, entry.isMe && styles.me]}>
      <View style={styles.position}>
        <Text style={styles.positionText}>{medal || `${entry.position}º`}</Text>
      </View>
      <Avatar emoji={entry.avatar} size={40} active={entry.isMe} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {entry.name} {entry.isMe ? '(vos)' : ''}
        </Text>
        <ProgressBar
          value={entry.steps}
          max={leaderSteps || 1}
          height={10}
          color={entry.isMe ? colors.lime : colors.blue}
        />
      </View>
      <Text style={[styles.steps, entry.isMe && { color: colors.lime }]}>
        {formatNumber(entry.steps)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    padding: spacing(3),
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.borderSoft,
  },
  me: { borderColor: colors.lime, backgroundColor: 'rgba(200,247,81,0.06)' },
  position: { width: 30, alignItems: 'center' },
  positionText: { color: colors.textSoft, fontSize: 16, fontWeight: '800' },
  info: { flex: 1, gap: spacing(1.5) },
  name: { color: colors.text, fontSize: 15, fontWeight: '800' },
  steps: { color: colors.text, fontSize: 15, fontWeight: '800', minWidth: 62, textAlign: 'right' },
});
