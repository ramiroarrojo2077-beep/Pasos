import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import PixelIcon from '../../src/components/PixelIcon';
import {
  Avatar,
  Badge,
  Button,
  Caption,
  EmptyState,
  Muted,
  Panel,
  Screen,
} from '../../src/components/ui';
import { ME, buildRanking, tournamentStatus, useStore } from '../../src/state/store';
import { colors, spacing, type } from '../../src/theme';
import { daysLeft, formatRange } from '../../src/utils/dates';
import { formatNumber, arcade } from '../../src/utils/format';

const STATUS = {
  activo: { label: 'En juego', color: colors.lime, tone: 'neon' },
  proximo: { label: 'Por empezar', color: colors.cyan, tone: 'cyan' },
  terminado: { label: 'Terminado', color: colors.textFaint, tone: 'dark' },
};

export default function Torneos() {
  const router = useRouter();
  const { tournaments, profile, history, friends, remotos } = useStore();

  const enriched = useMemo(
    () =>
      tournaments
        .map((t) => {
          const status = tournamentStatus(t);
          const ranking = buildRanking({ profile, history, friends, tournament: t, remotos });
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
        <View>
          <Caption color={colors.magenta}>Competencia</Caption>
          <Text style={[type.title, styles.title]}>TORNEOS</Text>
        </View>
        <Button label="Nuevo" icon="plus" size="sm" onPress={() => router.push('/torneo/nuevo')} />
      </View>

      <FlatList
        data={enriched}
        keyExtractor={(t) => t.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: spacing(4) }} />}
        ListEmptyComponent={
          <EmptyState
            icon="trophy"
            title="Sin torneos"
            subtitle="Creá uno, invitá a tus amigos con el código y que el último del ranking pague el café."
            action={
              <Button
                label="Crear torneo"
                icon="trophy"
                onPress={() => router.push('/torneo/nuevo')}
                style={{ marginTop: spacing(3) }}
              />
            }
          />
        }
        renderItem={({ item }) => {
          const st = STATUS[item.status];
          const leader = item.ranking[0];
          return (
            <Panel tone={st.tone} onPress={() => router.push(`/torneo/${item.id}`)} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={[styles.iconBox, { borderColor: st.color }]}>
                  <PixelIcon name={item.icon || 'trophy'} size={24} color={st.color} />
                </View>
                <View style={styles.flex}>
                  <Text style={[type.title, styles.name]} numberOfLines={1}>
                    {arcade(item.name)}
                  </Text>
                  <View style={styles.dateRow}>
                    <PixelIcon name="clock" size={11} color={colors.textFaint} />
                    <Text style={[type.tiny, styles.meta]}>
                      {formatRange(item.startISO, item.endISO)}
                      {item.status === 'activo' ? ` · ${daysLeft(item.endISO)}D` : ''}
                    </Text>
                  </View>
                </View>
                <Badge label={st.label} color={st.color} />
              </View>

              {item.prize ? (
                <View style={styles.prizeRow}>
                  <PixelIcon name="star" size={12} color={colors.amber} />
                  <Muted style={styles.prize} numberOfLines={1}>
                    {item.prize}
                  </Muted>
                </View>
              ) : null}

              <View style={styles.footer}>
                <View style={styles.avatars}>
                  {item.ranking.slice(0, 5).map((r, i) => (
                    <Avatar
                      key={r.id}
                      avatar={r.avatar}
                      size={30}
                      active={r.isMe}
                      style={i > 0 ? styles.overlap : null}
                    />
                  ))}
                </View>
                <View style={styles.footerRight}>
                  {leader ? (
                    <View style={styles.leaderRow}>
                      <PixelIcon name="crown" size={12} color={colors.gold} />
                      <Text style={[type.tiny, { color: colors.textDim }]}>
                        {leader.name.toUpperCase()} · {formatNumber(leader.steps)}
                      </Text>
                    </View>
                  ) : null}
                  <Text style={[type.tiny, styles.position]}>
                    {item.me ? `VAS ${item.me.position}º DE ${item.ranking.length}` : 'NO ESTÁS ANOTADO'}
                  </Text>
                </View>
              </View>
            </Panel>
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
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingVertical: spacing(4),
  },
  title: { fontSize: 16, color: colors.text, marginTop: 4 },
  list: { paddingBottom: spacing(8), paddingTop: spacing(1) },
  card: { gap: spacing(3) },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: spacing(3) },
  iconBox: {
    width: 44,
    height: 44,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.panelAlt,
  },
  name: { fontSize: 11, color: colors.text },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(1.5), marginTop: 5 },
  meta: { color: colors.textFaint, letterSpacing: 0.6 },
  prizeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(2) },
  prize: { flex: 1, fontSize: 11 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 2,
    borderTopColor: colors.borderDim,
    paddingTop: spacing(3),
  },
  avatars: { flexDirection: 'row' },
  overlap: { marginLeft: -10 },
  footerRight: { alignItems: 'flex-end', gap: 4 },
  leaderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(1.5) },
  position: { color: colors.lime, letterSpacing: 0.6 },
});
