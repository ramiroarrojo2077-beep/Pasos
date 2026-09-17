import React, { useMemo } from 'react';
import { Alert, FlatList, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import {
  Badge,
  Body,
  Button,
  Card,
  Muted,
  PixelText,
  Screen,
} from '../../src/components/ui';
import RankRow from '../../src/components/RankRow';
import { ME, buildRanking, tournamentStatus, useStore } from '../../src/state/store';
import { colors, spacing } from '../../src/theme';
import { daysLeft, formatRange } from '../../src/utils/dates';
import { formatNumber } from '../../src/utils/format';

const STATUS = {
  activo: { label: 'En juego', color: colors.lime },
  proximo: { label: 'Por empezar', color: colors.blue },
  terminado: { label: 'Terminado', color: colors.muted },
};

export default function TorneoDetalle() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { tournaments, profile, history, friends, removeTournament } = useStore();

  const tournament = useMemo(() => tournaments.find((t) => t.id === id), [tournaments, id]);

  const ranking = useMemo(() => {
    if (!tournament) return [];
    return buildRanking({ profile, history, friends, tournament });
  }, [tournament, profile, history, friends]);

  if (!tournament) {
    return (
      <Screen style={styles.screen}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.back}>←</Text>
        </Pressable>
        <Body style={styles.notFound}>Este torneo ya no existe.</Body>
      </Screen>
    );
  }

  const status = tournamentStatus(tournament);
  const st = STATUS[status];
  const me = ranking.find((r) => r.id === ME);
  const leader = ranking[0];
  const total = ranking.reduce((a, r) => a + r.steps, 0);

  const invite = async () => {
    const text = `¡Sumate a "${tournament.name}" en Pasos! Código: ${tournament.code}`;
    try {
      await Share.share({ message: text });
    } catch (err) {
      await Clipboard.setStringAsync(text);
      Alert.alert('Invitación copiada', text);
    }
  };

  const confirmDelete = () => {
    Alert.alert('Borrar torneo', `¿Eliminar "${tournament.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Borrar',
        style: 'destructive',
        onPress: () => {
          removeTournament(tournament.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <Screen style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.back}>←</Text>
        </Pressable>
        <Pressable onPress={confirmDelete} hitSlop={10}>
          <Text style={styles.trash}>🗑️</Text>
        </Pressable>
      </View>

      <FlatList
        data={ranking}
        keyExtractor={(r) => r.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: spacing(2.5) }} />}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <Text style={styles.emoji}>{tournament.emoji || '🏆'}</Text>
            <PixelText style={styles.name}>{tournament.name}</PixelText>
            <View style={styles.badges}>
              <Badge label={st.label} color={st.color} />
              <Badge label={formatRange(tournament.startISO, tournament.endISO)} color={colors.blue} />
              {status === 'activo' ? (
                <Badge label={`Quedan ${daysLeft(tournament.endISO)} días`} color={colors.orange} />
              ) : null}
            </View>

            {tournament.prize ? (
              <Card style={styles.prizeCard}>
                <Text style={styles.prizeText}>🎁 {tournament.prize}</Text>
              </Card>
            ) : null}

            <View style={styles.statsRow}>
              <Stat label="Tu puesto" value={me ? `${me.position}º` : '—'} highlight />
              <Stat label="Tus pasos" value={formatNumber(me?.steps || 0)} />
              <Stat label="Total del grupo" value={formatNumber(total)} />
            </View>

            {status === 'activo' && me && leader && me.id !== leader.id ? (
              <Muted style={styles.gap}>
                Te faltan {formatNumber(leader.steps - me.steps)} pasos para alcanzar a {leader.name}.
              </Muted>
            ) : null}
            {status === 'terminado' && leader ? (
              <Muted style={styles.gap}>🏅 Ganó {leader.name} con {formatNumber(leader.steps)} pasos.</Muted>
            ) : null}

            <Card style={styles.codeCard} onPress={invite}>
              <View style={styles.flex}>
                <Muted>Código de invitación</Muted>
                <Text style={styles.code}>{tournament.code}</Text>
              </View>
              <Button label="Invitar" icon="📤" onPress={invite} style={styles.inviteBtn} />
            </Card>

            <Text style={styles.rankTitle}>Tabla de posiciones</Text>
          </View>
        }
        renderItem={({ item }) => <RankRow entry={item} leaderSteps={leader?.steps || 1} />}
      />
    </Screen>
  );
}

function Stat({ label, value, highlight }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, highlight && { color: colors.lime }]}>{value}</Text>
      <Muted style={styles.statLabel}>{label}</Muted>
    </View>
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
  back: { color: colors.text, fontSize: 24, fontWeight: '800' },
  trash: { fontSize: 20 },
  headerBlock: { alignItems: 'center', gap: spacing(2), paddingBottom: spacing(4) },
  emoji: { fontSize: 44 },
  name: { fontSize: 15, color: colors.lime, textAlign: 'center', lineHeight: 24 },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(2),
    justifyContent: 'center',
    marginTop: spacing(2),
  },
  prizeCard: { width: '100%', marginTop: spacing(3), paddingVertical: spacing(3) },
  prizeText: { color: colors.textSoft, fontSize: 14, textAlign: 'center', fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: spacing(3), marginTop: spacing(4), width: '100%' },
  stat: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.borderSoft,
    padding: spacing(3),
    alignItems: 'center',
    gap: 2,
  },
  statValue: { color: colors.text, fontSize: 17, fontWeight: '900' },
  statLabel: { fontSize: 10, textAlign: 'center' },
  gap: { marginTop: spacing(3), textAlign: 'center' },
  codeCard: {
    width: '100%',
    marginTop: spacing(4),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
  },
  code: { color: colors.lime, fontSize: 22, fontWeight: '900', letterSpacing: 3 },
  inviteBtn: { minHeight: 42, paddingHorizontal: spacing(4) },
  rankTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    alignSelf: 'flex-start',
    marginTop: spacing(5),
  },
  list: { paddingBottom: spacing(8) },
  notFound: { textAlign: 'center', marginTop: spacing(10) },
});
