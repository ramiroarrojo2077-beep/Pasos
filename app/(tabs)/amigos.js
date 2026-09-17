import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import {
  Avatar,
  Button,
  Card,
  Chip,
  EmptyState,
  Muted,
  Screen,
} from '../../src/components/ui';
import RankRow from '../../src/components/RankRow';
import { ME, stepsInRange, useStore } from '../../src/state/store';
import { colors, radius, spacing } from '../../src/theme';
import { addDays, dayKey, startOfDay } from '../../src/utils/dates';
import { formatNumber } from '../../src/utils/format';

const RANGES = [
  { id: 'hoy', label: 'Hoy', days: 1 },
  { id: 'semana', label: 'Semana', days: 7 },
  { id: 'mes', label: 'Mes', days: 30 },
];

export default function Amigos() {
  const router = useRouter();
  const { friends, profile, history, removeFriend } = useStore();
  const [range, setRange] = useState('semana');

  const { startISO, endISO } = useMemo(() => {
    const days = RANGES.find((r) => r.id === range).days;
    return {
      startISO: startOfDay(addDays(new Date(), -(days - 1))).toISOString(),
      endISO: new Date().toISOString(),
    };
  }, [range]);

  const ranking = useMemo(() => {
    const me = {
      id: ME,
      name: profile.name || 'Vos',
      avatar: profile.avatar,
      isMe: true,
      steps: stepsInRange({ history }, startISO, endISO),
    };
    const rest = friends.map((f) => ({
      id: f.id,
      name: f.name,
      avatar: f.avatar,
      isMe: false,
      steps: stepsInRange(f, startISO, endISO),
    }));
    return [me, ...rest]
      .sort((a, b) => b.steps - a.steps)
      .map((e, i) => ({ ...e, position: i + 1 }));
  }, [friends, profile, history, startISO, endISO]);

  const leaderSteps = ranking[0]?.steps || 1;

  const copyCode = async () => {
    await Clipboard.setStringAsync(profile.code);
    Alert.alert('Código copiado', `Compartí ${profile.code} con tus amigos para que te agreguen.`);
  };

  const confirmRemove = (friend) => {
    Alert.alert('Quitar amigo', `¿Sacar a ${friend.name} de tu lista?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Quitar', style: 'destructive', onPress: () => removeFriend(friend.id) },
    ]);
  };

  return (
    <Screen style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Amigos</Text>
        <Button
          label="Agregar"
          icon="+"
          onPress={() => router.push('/agregar-amigo')}
          style={styles.addBtn}
        />
      </View>

      <Card style={styles.codeCard} onPress={copyCode}>
        <View style={styles.flex}>
          <Muted>Tu código para que te agreguen</Muted>
          <Text style={styles.code}>{profile.code}</Text>
        </View>
        <Text style={styles.copy}>📋</Text>
      </Card>

      <View style={styles.chips}>
        {RANGES.map((r) => (
          <Chip
            key={r.id}
            label={r.label}
            active={range === r.id}
            onPress={() => setRange(r.id)}
          />
        ))}
      </View>

      <FlatList
        data={ranking}
        keyExtractor={(e) => e.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: spacing(2.5) }} />}
        ListEmptyComponent={
          <EmptyState
            icon="👥"
            title="Todavía estás solo"
            subtitle="Agregá amigos con su código y competí por los pasos de la semana."
          />
        }
        renderItem={({ item }) => {
          const friend = friends.find((f) => f.id === item.id);
          return (
            <Pressable
              onLongPress={friend ? () => confirmRemove(friend) : undefined}
              delayLongPress={500}
            >
              <RankRow entry={item} leaderSteps={leaderSteps} />
            </Pressable>
          );
        }}
        ListFooterComponent={
          friends.length ? (
            <Muted style={styles.hint}>Mantené apretado a un amigo para quitarlo.</Muted>
          ) : null
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: spacing(4) },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing(3),
  },
  title: { color: colors.text, fontSize: 20, fontWeight: '800' },
  addBtn: { minHeight: 42, paddingHorizontal: spacing(4) },
  codeCard: { flexDirection: 'row', alignItems: 'center', gap: spacing(3) },
  code: {
    color: colors.lime,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 4,
    marginTop: 2,
  },
  copy: { fontSize: 22 },
  chips: { flexDirection: 'row', gap: spacing(2), marginTop: spacing(4) },
  list: { paddingTop: spacing(4), paddingBottom: spacing(8) },
  hint: { textAlign: 'center', marginTop: spacing(4), fontSize: 11 },
});
