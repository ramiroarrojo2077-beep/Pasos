import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  Muted,
  Screen,
} from '../../src/components/ui';
import { ME, buildRanking, tournamentStatus, useStore } from '../../src/state/store';
import { colors, spacing } from '../../src/theme';
import { daysLeft, formatRange } from '../../src/utils/dates';
import { formatNumber } from '../../src/utils/format';

const STATUS_LABEL = {
  activo: { label: 'En juego', color: colors.lime },
  proximo: { label: 'Por empezar', color: colors.blue },
  terminado: { label: 'Terminado', color: colors.muted },
};

export default function Torneos() {
  const router = useRouter();
  const store = useStore();
  const { tournaments, profile, history, friends } = store;

  const enriched = useMemo(
    () =>
      tournaments
        .map((t) => {
          const status = tournamentStatus(t);
          const ranking = buildRanking({ profile, history, friends, tournament: t });
          return { ...t, status, ranking, me: ranking.find((r) => r.id === ME) };
        })
        .sort((a, b) => {
          const order = { activo: 0, proximo: 1, terminado: 2 };
          return order[a.status] - order[b.status];
        }),
    [tournaments, profile, history, friends],
  );

  return (
    <Screen style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Torneos</Text>
        <Button
          label="Nuevo"
          icon="+"
          onPress={() => router.push('/torneo/nuevo')}
          style={styles.newBtn}
        />
      </View>

      <FlatList
        data={enriched}
        keyExtractor={(t) => t.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: spacing(3) }} />}
        ListEmptyComponent={
          <EmptyState
            icon="🏆"
            title="Sin torneos todavía"
            subtitle="Creá uno, invitá a tus amigos con el código y el que menos camina invita el café."
            action={
              <Button
                label="Crear torneo"
                onPress={() => router.push('/torneo/nuevo')}
                style={{ marginTop: spacing(4) }}
              />
            }
          />
        }
        renderItem={({ item }) => {
          const st = STATUS_LABEL[item.status];
          const leader = item.ranking[0];
          return (
            <Card onPress={() => router.push(`/torneo/${item.id}`)} style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.emoji}>{item.emoji || '🏆'}</Text>
                <View style={styles.flex}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Muted>{formatRange(item.startISO, item.endISO)}</Muted>
                </View>
                <Badge label={st.label} color={st.color} />
              </View>

              {item.prize ? <Muted style={styles.prize}>🎁 {item.prize}</Muted> : null}

              <View style={styles.footer}>
                <View style={styles.avatars}>
                  {item.ranking.slice(0, 5).map((r, i) => (
                    <Avatar
                      key={r.id}
                      emoji={r.avatar}
                      size={32}
                      active={r.isMe}
                      style={i > 0 ? styles.overlap : null}
                    />
                  ))}
                </View>
                <View style={styles.footerRight}>
                  {leader ? (
                    <Muted>
                      👑 {leader.name} · {formatNumber(leader.steps)}
                    </Muted>
                  ) : null}
                  <Text style={styles.position}>
                    {item.me ? `Vas ${item.me.position}º` : 'No estás anotado'}
                    {item.status === 'activo'
                      ? ` · ${daysLeft(item.endISO)}d`
                      : ''}
                  </Text>
                </View>
              </View>
            </Card>
          );
        }}
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
  newBtn: { minHeight: 42, paddingHorizontal: spacing(4) },
  list: { paddingBottom: spacing(8) },
  card: { gap: spacing(3) },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: spacing(3) },
  emoji: { fontSize: 28 },
  name: { color: colors.text, fontSize: 16, fontWeight: '800' },
  prize: { fontSize: 12 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 2,
    borderTopColor: colors.borderSoft,
    paddingTop: spacing(3),
  },
  avatars: { flexDirection: 'row' },
  overlap: { marginLeft: -10 },
  footerRight: { alignItems: 'flex-end', gap: 2 },
  position: { color: colors.lime, fontSize: 12, fontWeight: '800' },
});
