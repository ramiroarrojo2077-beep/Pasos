import React, { useMemo } from 'react';
import { Alert, FlatList, Share, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import PixelIcon from '../../src/components/PixelIcon';
import {
  Avatar,
  Badge,
  Body,
  Button,
  Caption,
  Display,
  IconButton,
  Muted,
  Panel,
  Score,
  Screen,
} from '../../src/components/ui';
import RankRow from '../../src/components/RankRow';
import { ME, buildRanking, tournamentStatus, useStore } from '../../src/state/store';
import { colors, spacing, type } from '../../src/theme';
import { daysLeft, formatRange } from '../../src/utils/dates';
import { formatNumber } from '../../src/utils/format';

const STATUS = {
  activo: { label: 'En juego', color: colors.lime },
  proximo: { label: 'Por empezar', color: colors.cyan },
  terminado: { label: 'Terminado', color: colors.textFaint },
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
        <IconButton icon="chevron" flip onPress={() => router.back()} />
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
    const text = `Sumate a "${tournament.name}" en Pasos. Código: ${tournament.code}`;
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
      <View style={styles.topBar}>
        <IconButton icon="chevron" flip onPress={() => router.back()} />
        <Caption color={colors.textFaint}>Torneo</Caption>
        <IconButton icon="trash" size={18} color={colors.textFaint} onPress={confirmDelete} />
      </View>

      <FlatList
        data={ranking}
        keyExtractor={(r) => r.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: spacing(3) }} />}
        ListHeaderComponent={
          <View style={styles.head}>
            <View style={styles.titleRow}>
              <View style={[styles.iconBox, { borderColor: st.color }]}>
                <PixelIcon name={tournament.icon || 'trophy'} size={32} color={st.color} />
              </View>
              <View style={styles.flex}>
                <Display style={styles.name}>{tournament.name.toUpperCase()}</Display>
                <View style={styles.badges}>
                  <Badge label={st.label} color={st.color} />
                  <Badge
                    label={formatRange(tournament.startISO, tournament.endISO)}
                    color={colors.cyan}
                    icon="clock"
                  />
                </View>
              </View>
            </View>

            {tournament.prize ? (
              <Panel tone="dark" style={styles.prizeCard}>
                <PixelIcon name="star" size={18} color={colors.amber} />
                <View style={styles.flex}>
                  <Caption color={colors.amber}>Premio</Caption>
                  <Body style={styles.prizeText}>{tournament.prize}</Body>
                </View>
              </Panel>
            ) : null}

            <View style={styles.statsRow}>
              <Stat label="Tu puesto" value={me ? `${me.position}º` : '—'} color={colors.gold} />
              <Stat label="Tus pasos" value={formatNumber(me?.steps || 0)} color={colors.lime} />
              <Stat label="Grupo" value={formatNumber(total)} color={colors.cyan} />
            </View>

            {status === 'activo' && me && leader && me.id !== leader.id ? (
              <Panel tone="dark" style={styles.gapCard}>
                <PixelIcon name="flame" size={16} color={colors.magenta} />
                <Body style={styles.gapText}>
                  Te faltan {formatNumber(leader.steps - me.steps)} pasos para alcanzar a{' '}
                  {leader.name}. Quedan {daysLeft(tournament.endISO)} días.
                </Body>
              </Panel>
            ) : null}
            {status === 'terminado' && leader ? (
              <Panel tone="dark" style={styles.gapCard}>
                <PixelIcon name="crown" size={16} color={colors.gold} />
                <Body style={styles.gapText}>
                  Ganó {leader.name} con {formatNumber(leader.steps)} pasos.
                </Body>
              </Panel>
            ) : null}

            <Panel tone="cyan" style={styles.codeCard}>
              <View style={styles.flex}>
                <Caption color={colors.cyan}>Código de invitación</Caption>
                <Score style={styles.code}>{tournament.code}</Score>
              </View>
              <Button label="Invitar" icon="share" size="sm" onPress={invite} />
            </Panel>

            <View style={styles.rankHeader}>
              <View style={styles.tick} />
              <Text style={[type.title, { fontSize: 11, color: colors.text }]}>
                TABLA DE POSICIONES
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }) => <RankRow entry={item} leaderSteps={leader?.steps || 1} />}
      />
    </Screen>
  );
}

function Stat({ label, value, color }) {
  return (
    <Panel tone="dark" style={styles.stat} shadow={false}>
      <Score small style={{ color, fontSize: 11 }}>
        {value}
      </Score>
      <Caption color={colors.textFaint}>{label}</Caption>
    </Panel>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: spacing(4) },
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing(3),
  },
  list: { paddingBottom: spacing(8) },
  head: { gap: spacing(4), paddingBottom: spacing(4) },
  titleRow: { flexDirection: 'row', gap: spacing(3), alignItems: 'center' },
  iconBox: {
    width: 56,
    height: 56,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.panelAlt,
  },
  name: { fontSize: 14, lineHeight: 22 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(2), marginTop: spacing(2) },
  prizeCard: { flexDirection: 'row', alignItems: 'center', gap: spacing(3), padding: spacing(3) },
  prizeText: { fontSize: 12, color: colors.textDim, marginTop: 3 },
  statsRow: { flexDirection: 'row', gap: spacing(3) },
  stat: { flex: 1, padding: spacing(3), gap: spacing(2), alignItems: 'center' },
  gapCard: { flexDirection: 'row', alignItems: 'center', gap: spacing(3), padding: spacing(3) },
  gapText: { flex: 1, fontSize: 12 },
  codeCard: { flexDirection: 'row', alignItems: 'center', gap: spacing(3) },
  code: { color: colors.cyan, fontSize: 20, letterSpacing: 4, marginTop: spacing(2) },
  rankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
    marginTop: spacing(2),
  },
  tick: { width: 4, height: 14, backgroundColor: colors.lime },
  notFound: { textAlign: 'center', marginTop: spacing(10) },
});
