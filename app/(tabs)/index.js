import React, { useMemo } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import PixelIcon from '../../src/components/PixelIcon';
import {
  Avatar,
  Badge,
  Body,
  Button,
  Caption,
  IconButton,
  Muted,
  Panel,
  Score,
  Screen,
  SectionHeader,
  SegmentBar,
} from '../../src/components/ui';
import MapaSeguro from '../../src/components/MapaSeguro';
import PlaceRow from '../../src/components/PlaceRow';
import { usePlaces } from '../../src/state/places';
import { useSteps } from '../../src/state/steps';
import { ME, buildRanking, tournamentStatus, useStore } from '../../src/state/store';
import { colors, spacing, type } from '../../src/theme';
import { dayKey, daysLeft, lastNDays, shortWeekday } from '../../src/utils/dates';
import { formatNumber, stepsToKcal, stepsToKm, arcade } from '../../src/utils/format';

export default function Home() {
  const router = useRouter();
  const { profile, history, friends, tournaments, remotos, addSteps } = useStore();
  const { manualMode } = useSteps();
  const { places, center, loading } = usePlaces();

  const today = history[dayKey()] || 0;
  const goal = profile.goal || 10000;
  const pct = Math.min(999, Math.round((today / goal) * 100));

  const week = useMemo(() => {
    const days = lastNDays(7);
    const max = Math.max(goal, ...days.map((d) => history[d] || 0));
    return days.map((d) => ({ key: d, steps: history[d] || 0, max }));
  }, [history, goal]);

  const activeTournament = useMemo(
    () => tournaments.find((t) => tournamentStatus(t) === 'activo') || tournaments[0],
    [tournaments],
  );

  const ranking = useMemo(() => {
    if (!activeTournament) return [];
    return buildRanking({ profile, history, friends, tournament: activeTournament });
  }, [activeTournament, profile, history, friends]);

  const myPosition = ranking.find((r) => r.id === ME)?.position;
  const friendsToday = friends
    .map((f) => ({ ...f, steps: f.history?.[dayKey()] || 0 }))
    .sort((a, b) => b.steps - a.steps)
    .slice(0, 4);

  const nearest = places[0];

  return (
    <Screen scroll style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Avatar avatar={profile.avatar} size={44} active />
          <View style={styles.headerText}>
            <Caption color={colors.cyan}>Jugador</Caption>
            <Text style={[type.title, styles.playerName]} numberOfLines={1}>
              {arcade(profile.name || 'Jugador 1')}
            </Text>
          </View>
        </View>
        <IconButton icon="gear" color={colors.textDim} onPress={() => router.push('/perfil')} />
      </View>

      {/* Marcador principal */}
      <Panel tone="neon" style={styles.scoreCard}>
        <View style={styles.scoreTop}>
          <View style={styles.scoreLeft}>
            <Caption color={colors.textFaint}>Pasos de hoy</Caption>
            <Score style={styles.scoreNumber}>{formatNumber(today)}</Score>
          </View>
          <View style={styles.scoreRight}>
            <PixelIcon name="shoe" size={38} color={colors.lime} />
            <Badge label={`${pct}%`} color={pct >= 100 ? colors.lime : colors.cyan} />
          </View>
        </View>

        <SegmentBar value={today} max={goal} segments={20} height={16} />

        <View style={styles.scoreMeta}>
          <View style={styles.metaItem}>
            <PixelIcon name="target" size={12} color={colors.textFaint} />
            <Text style={[type.tiny, styles.metaText]}>META {formatNumber(goal)}</Text>
          </View>
          <View style={styles.metaItem}>
            <PixelIcon name="pin" size={12} color={colors.textFaint} />
            <Text style={[type.tiny, styles.metaText]}>
              {stepsToKm(today).toFixed(2).replace('.', ',')} KM
            </Text>
          </View>
          <View style={styles.metaItem}>
            <PixelIcon name="flame" size={12} color={colors.textFaint} />
            <Text style={[type.tiny, styles.metaText]}>{stepsToKcal(today)} KCAL</Text>
          </View>
        </View>

        {manualMode ? (
          <View style={styles.manualBox}>
            <Muted style={styles.manualText}>
              {Platform.OS === 'web'
                ? 'El navegador no tiene podómetro. Cargá los pasos a mano o abrí la app en el teléfono.'
                : 'Este dispositivo no tiene podómetro. Podés cargar los pasos a mano.'}
            </Muted>
            <View style={styles.manualButtons}>
              {[500, 1000, 2500].map((n) => (
                <Button
                  key={n}
                  label={`+${n}`}
                  variant="dark"
                  size="sm"
                  style={styles.manualBtn}
                  onPress={() => addSteps(n)}
                />
              ))}
            </View>
          </View>
        ) : null}
      </Panel>

      {/* Semana */}
      <Panel tone="dark" style={styles.weekCard}>
        <Caption>Últimos 7 días</Caption>
        <View style={styles.weekRow}>
          {week.map((d) => {
            const hit = d.steps >= goal;
            return (
              <View key={d.key} style={styles.weekItem}>
                <View style={styles.weekTrack}>
                  <View
                    style={[
                      styles.weekFill,
                      {
                        height: `${Math.max(3, (d.steps / d.max) * 100)}%`,
                        backgroundColor:
                          d.steps === 0 ? colors.borderDim : hit ? colors.lime : colors.cyan,
                      },
                    ]}
                  />
                </View>
                <Text style={[type.tiny, styles.weekLabel]}>
                  {shortWeekday(d.key).toUpperCase()}
                </Text>
              </View>
            );
          })}
        </View>
      </Panel>

      {/* Rivales */}
      <View style={styles.section}>
        <SectionHeader
          title="Rivales de hoy"
          actionLabel="Ver todos"
          color={colors.magenta}
          onAction={() => router.push('/amigos')}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.friendsRow}>
          {friendsToday.map((f, i) => (
            <Pressable key={f.id} style={styles.friend} onPress={() => router.push('/amigos')}>
              <View style={styles.friendRank}>
                <Text style={[type.tiny, { color: colors.textFaint }]}>{i + 1}</Text>
              </View>
              <Avatar avatar={f.avatar} size={50} />
              <Text style={[type.tiny, styles.friendName]} numberOfLines={1}>
                {f.name.toUpperCase()}
              </Text>
              <Text style={[type.tiny, styles.friendSteps]}>{formatNumber(f.steps)}</Text>
            </Pressable>
          ))}
          <Pressable style={styles.friend} onPress={() => router.push('/agregar-amigo')}>
            <View style={styles.friendRank} />
            <View style={styles.addFriend}>
              <PixelIcon name="plus" size={20} color={colors.textDim} />
            </View>
            <Text style={[type.tiny, styles.friendName]}>SUMAR</Text>
          </Pressable>
        </ScrollView>
      </View>

      {/* Torneo activo */}
      {activeTournament ? (
        <Panel
          tone="magenta"
          style={styles.tournamentCard}
          onPress={() => router.push(`/torneo/${activeTournament.id}`)}
        >
          <View style={styles.tournamentTop}>
            <PixelIcon name={activeTournament.icon || 'trophy'} size={28} color={colors.magenta} />
            <View style={styles.flex}>
              <Caption color={colors.magenta}>Torneo en curso</Caption>
              <Text style={[type.title, styles.tournamentName]} numberOfLines={1}>
                {arcade(activeTournament.name)}
              </Text>
            </View>
            <View style={styles.positionBox}>
              <Text style={[type.scoreSm, { color: colors.gold }]}>
                {myPosition ? `${myPosition}º` : '—'}
              </Text>
              <Caption color={colors.textFaint}>puesto</Caption>
            </View>
          </View>

          <View style={styles.podium}>
            {ranking.slice(0, 3).map((r, i) => (
              <View key={r.id} style={styles.podiumItem}>
                {i === 0 ? <PixelIcon name="crown" size={14} color={colors.gold} /> : <View style={{ height: 14 }} />}
                <Avatar avatar={r.avatar} size={36} active={r.isMe} />
                <Text style={[type.tiny, styles.podiumName]} numberOfLines={1}>
                  {r.name.toUpperCase()}
                </Text>
                <Text style={[type.tiny, styles.podiumSteps]}>{formatNumber(r.steps)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.tournamentFoot}>
            <PixelIcon name="clock" size={12} color={colors.textFaint} />
            <Text style={[type.tiny, styles.metaText]}>
              QUEDAN {daysLeft(activeTournament.endISO)} DÍAS
            </Text>
            <View style={styles.flex} />
            <PixelIcon name="users" size={12} color={colors.textFaint} />
            <Text style={[type.tiny, styles.metaText]}>
              {activeTournament.participantIds.length} EN JUEGO
            </Text>
          </View>
        </Panel>
      ) : (
        <Panel style={styles.tournamentCard}>
          <Caption>Sin torneos</Caption>
          <Body style={{ marginVertical: spacing(2) }}>
            Armá uno y competí con tus amigos por la mayor cantidad de pasos.
          </Body>
          <Button label="Crear torneo" icon="trophy" onPress={() => router.push('/torneo/nuevo')} />
        </Panel>
      )}

      {/* Mapa */}
      <View style={styles.section}>
        <SectionHeader
          title="Cerca tuyo"
          actionLabel="Ver mapa"
          color={colors.cyan}
          onAction={() => router.push('/mapa')}
        />
        <Panel tone="dark" style={styles.mapCard}>
          <View style={styles.mapWrap}>
            <MapaSeguro center={center} places={places.slice(0, 12)} showTag={false} />
          </View>
          {nearest ? (
            <PlaceRow
              place={nearest}
              compact
              onPress={() => router.push(`/lugar/${encodeURIComponent(nearest.id)}`)}
            />
          ) : (
            <Body style={styles.mapEmpty}>
              {loading ? 'Buscando lugares…' : 'Todavía no encontramos lugares cerca.'}
            </Body>
          )}
        </Panel>
      </View>
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
    paddingVertical: spacing(4),
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing(3), flex: 1 },
  headerText: { flex: 1, gap: 3 },
  playerName: { fontSize: 12, color: colors.text },

  scoreCard: { gap: spacing(3) },
  scoreTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  scoreLeft: { gap: spacing(2) },
  scoreRight: { alignItems: 'center', gap: spacing(2) },
  scoreNumber: { fontSize: 30, lineHeight: 36 },
  scoreMeta: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing(2) },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: spacing(1.5) },
  metaText: { color: colors.textFaint, letterSpacing: 0.6 },
  manualBox: {
    borderTopWidth: 2,
    borderTopColor: colors.borderDim,
    paddingTop: spacing(3),
    gap: spacing(3),
  },
  manualText: { fontSize: 11, lineHeight: 16 },
  manualButtons: { flexDirection: 'row', gap: spacing(3) },
  manualBtn: { flex: 1 },

  weekCard: { marginTop: spacing(5), gap: spacing(3), padding: spacing(3) },
  weekRow: { flexDirection: 'row', gap: spacing(2) },
  weekItem: { flex: 1, alignItems: 'center', gap: spacing(1.5) },
  weekTrack: {
    width: '100%',
    height: 52,
    backgroundColor: colors.bgDeep,
    borderWidth: 2,
    borderColor: colors.borderDim,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  weekFill: { width: '100%' },
  weekLabel: { color: colors.textFaint, fontSize: 9 },

  section: { marginTop: spacing(6) },
  friendsRow: { gap: spacing(3), paddingRight: spacing(4), paddingVertical: spacing(1) },
  friend: { alignItems: 'center', gap: spacing(1.5), width: 64 },
  friendRank: { height: 12, justifyContent: 'center' },
  friendName: { color: colors.textDim, fontSize: 9 },
  friendSteps: { color: colors.lime, fontSize: 10 },
  addFriend: {
    width: 50,
    height: 50,
    borderWidth: 3,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.panelAlt,
  },

  tournamentCard: { marginTop: spacing(6), gap: spacing(4) },
  tournamentTop: { flexDirection: 'row', alignItems: 'center', gap: spacing(3) },
  tournamentName: { fontSize: 11, color: colors.text, marginTop: 3 },
  positionBox: { alignItems: 'center', gap: 2 },
  podium: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 2,
    borderTopColor: colors.borderDim,
    borderBottomWidth: 2,
    borderBottomColor: colors.borderDim,
    paddingVertical: spacing(3),
  },
  podiumItem: { alignItems: 'center', gap: spacing(1), width: 82 },
  podiumName: { color: colors.textDim, fontSize: 9 },
  podiumSteps: { color: colors.text, fontSize: 10 },
  tournamentFoot: { flexDirection: 'row', alignItems: 'center', gap: spacing(1.5) },

  mapCard: { padding: spacing(3), gap: spacing(3) },
  mapWrap: {
    height: 176,
    borderWidth: 3,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  mapEmpty: { textAlign: 'center', paddingVertical: spacing(3) },
});
