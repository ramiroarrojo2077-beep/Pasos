import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import PixelIcon from '../../src/components/PixelIcon';
import {
  Button,
  Caption,
  Chip,
  EmptyState,
  Muted,
  Panel,
  Screen,
} from '../../src/components/ui';
import RankRow from '../../src/components/RankRow';
import { ME, stepsInRange, useStore } from '../../src/state/store';
import { colors, spacing, type } from '../../src/theme';
import { addDays, startOfDay } from '../../src/utils/dates';
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
      name: profile.name || 'VOS',
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
  const total = ranking.reduce((a, r) => a + r.steps, 0);

  const copyCode = async () => {
    await Clipboard.setStringAsync(profile.code);
    Alert.alert('Código copiado', `Compartí ${profile.code} para que te agreguen a su lista.`);
  };

  const confirmRemove = (friend) => {
    Alert.alert('Quitar jugador', `¿Sacar a ${friend.name} de tu lista?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Quitar', style: 'destructive', onPress: () => removeFriend(friend.id) },
    ]);
  };

  return (
    <Screen style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Caption color={colors.magenta}>Tabla general</Caption>
          <Text style={[type.title, styles.title]}>AMIGOS</Text>
        </View>
        <Button label="Sumar" icon="plus" size="sm" onPress={() => router.push('/agregar-amigo')} />
      </View>

      <Panel tone="cyan" style={styles.codeCard} onPress={copyCode}>
        <View style={styles.flex}>
          <Caption color={colors.cyan}>Tu código de jugador</Caption>
          <Text style={[type.score, styles.code]}>{profile.code}</Text>
        </View>
        <View style={styles.copyBox}>
          <PixelIcon name="clipboard" size={20} color={colors.cyan} />
        </View>
      </Panel>

      <View style={styles.controls}>
        <View style={styles.chips}>
          {RANGES.map((r) => (
            <Chip key={r.id} label={r.label} active={range === r.id} onPress={() => setRange(r.id)} />
          ))}
        </View>
        <Text style={[type.tiny, { color: colors.textFaint }]}>
          TOTAL {formatNumber(total)}
        </Text>
      </View>

      <FlatList
        data={ranking}
        keyExtractor={(e) => e.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: spacing(3) }} />}
        ListEmptyComponent={
          <EmptyState
            icon="users"
            title="Sin rivales"
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
            <Muted style={styles.hint}>Mantené apretado a un jugador para quitarlo.</Muted>
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
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingVertical: spacing(4),
  },
  title: { fontSize: 16, color: colors.text, marginTop: 4 },
  codeCard: { flexDirection: 'row', alignItems: 'center', gap: spacing(3) },
  code: { color: colors.cyan, fontSize: 20, letterSpacing: 4, marginTop: spacing(2) },
  copyBox: {
    width: 42,
    height: 42,
    borderWidth: 3,
    borderColor: colors.borderDim,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.panelAlt,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing(5),
  },
  chips: { flexDirection: 'row', gap: spacing(2) },
  list: { paddingTop: spacing(4), paddingBottom: spacing(8) },
  hint: { textAlign: 'center', marginTop: spacing(5), fontSize: 10 },
});
