import React, { useMemo } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Avatar,
  Badge,
  Body,
  Button,
  Card,
  Muted,
  PixelText,
  ProgressBar,
  Screen,
  SectionHeader,
} from '../../src/components/ui';
import PlacesMap from '../../src/components/PlacesMap';
import PlaceRow from '../../src/components/PlaceRow';
import { useSteps } from '../../src/state/steps';
import { usePlaces } from '../../src/state/places';
import { ME, buildRanking, stepsInRange, tournamentStatus, useStore } from '../../src/state/store';
import { colors, radius, spacing } from '../../src/theme';
import { dayKey, daysLeft, lastNDays, shortWeekday } from '../../src/utils/dates';
import { formatNumber, stepsToKcal, stepsToKm } from '../../src/utils/format';

export default function Home() {
  const router = useRouter();
  const store = useStore();
  const { profile, history, friends, tournaments, addSteps } = store;
  const { available, manualMode } = useSteps();
  const { places, center, loading } = usePlaces();

  const today = history[dayKey()] || 0;
  const goal = profile.goal || 10000;
  const pct = Math.min(100, Math.round((today / goal) * 100));

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
          <Avatar emoji={profile.avatar} size={46} active />
          <View>
            <Text style={styles.hello}>¡Hola, {profile.name || 'Caminante'}!</Text>
            <Muted>{pct >= 100 ? '¡Meta cumplida hoy! 🎉' : `Vas ${pct}% de tu meta`}</Muted>
          </View>
        </View>
        <Pressable onPress={() => router.push('/perfil')} hitSlop={10}>
          <Text style={styles.gear}>⚙️</Text>
        </Pressable>
      </View>

      <Card glow style={styles.stepsCard}>
        <View style={styles.stepsTop}>
          <Text style={styles.shoe}>👟</Text>
          <View style={styles.stepsInfo}>
            <Muted>Tus pasos hoy</Muted>
            <PixelText style={styles.stepsNumber}>{formatNumber(today)}</PixelText>
          </View>
        </View>
        <ProgressBar value={today} max={goal} height={16} />
        <View style={styles.stepsMetaRow}>
          <Muted>de {formatNumber(goal)}</Muted>
          <Muted>
            {stepsToKm(today).toFixed(2).replace('.', ',')} km · {stepsToKcal(today)} kcal
          </Muted>
        </View>
        {manualMode || available === false ? (
          <View style={styles.manualBox}>
            <Muted style={styles.manualText}>
              {Platform.OS === 'web'
                ? 'En la web no hay podómetro: cargá tus pasos a mano o abrí la app en el teléfono.'
                : 'Este dispositivo no tiene podómetro. Podés cargar tus pasos a mano.'}
            </Muted>
            <View style={styles.manualButtons}>
              {[500, 1000, 2500].map((n) => (
                <Button
                  key={n}
                  label={`+${n}`}
                  variant="dark"
                  style={styles.manualBtn}
                  onPress={() => addSteps(n)}
                />
              ))}
            </View>
          </View>
        ) : null}
      </Card>

      <View style={styles.weekRow}>
        {week.map((d) => (
          <View key={d.key} style={styles.weekItem}>
            <View style={styles.weekBarTrack}>
              <View
                style={[
                  styles.weekBarFill,
                  {
                    height: `${Math.max(4, (d.steps / d.max) * 100)}%`,
                    backgroundColor: d.steps >= goal ? colors.lime : colors.blue,
                  },
                ]}
              />
            </View>
            <Muted style={styles.weekLabel}>{shortWeekday(d.key)}</Muted>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="Con tus amigos"
          actionLabel="Ver todos"
          onAction={() => router.push('/amigos')}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.friendsRow}>
          {friendsToday.map((f) => (
            <Pressable key={f.id} style={styles.friend} onPress={() => router.push('/amigos')}>
              <Avatar emoji={f.avatar} size={54} />
              <Text style={styles.friendName}>{f.name}</Text>
              <Text style={styles.friendSteps}>{formatNumber(f.steps)}</Text>
            </Pressable>
          ))}
          <Pressable style={styles.friend} onPress={() => router.push('/agregar-amigo')}>
            <View style={styles.addFriend}>
              <Text style={styles.addFriendIcon}>+</Text>
            </View>
            <Text style={styles.friendName}>Agregar</Text>
          </Pressable>
        </ScrollView>
      </View>

      {activeTournament ? (
        <Card
          style={styles.tournamentCard}
          onPress={() => router.push(`/torneo/${activeTournament.id}`)}
        >
          <View style={styles.tournamentTop}>
            <Text style={styles.trophy}>{activeTournament.emoji || '🏆'}</Text>
            <View style={styles.flex}>
              <Text style={styles.tournamentName}>{activeTournament.name}</Text>
              <Muted>
                Quedan {daysLeft(activeTournament.endISO)} días · {activeTournament.participantIds.length} jugando
              </Muted>
            </View>
            <Badge label={myPosition ? `${myPosition}º` : '—'} color={colors.gold} />
          </View>
          <View style={styles.podium}>
            {ranking.slice(0, 3).map((r) => (
              <View key={r.id} style={styles.podiumItem}>
                <Avatar emoji={r.avatar} size={38} active={r.isMe} />
                <Text style={styles.podiumName} numberOfLines={1}>
                  {r.name}
                </Text>
                <Text style={[styles.podiumSteps, r.isMe && { color: colors.lime }]}>
                  {formatNumber(r.steps)}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      ) : (
        <Card style={styles.tournamentCard}>
          <Text style={styles.tournamentName}>Todavía no hay torneos</Text>
          <Muted style={{ marginVertical: spacing(2) }}>
            Armá uno y competí con tus amigos por la mayor cantidad de pasos.
          </Muted>
          <Button label="Crear torneo" icon="🏆" onPress={() => router.push('/torneo/nuevo')} />
        </Card>
      )}

      <View style={styles.section}>
        <SectionHeader title="Cerca tuyo" actionLabel="Ver mapa" onAction={() => router.push('/mapa')} />
        <Card style={styles.mapCard}>
          <View style={styles.mapWrap}>
            <PlacesMap center={center} places={places.slice(0, 12)} />
          </View>
          {nearest ? (
            <PlaceRow
              place={nearest}
              compact
              onPress={() => router.push(`/lugar/${encodeURIComponent(nearest.id)}`)}
            />
          ) : (
            <Body style={styles.mapEmpty}>
              {loading ? 'Buscando lugares cerca…' : 'No encontramos lugares cerca todavía.'}
            </Body>
          )}
        </Card>
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
    paddingVertical: spacing(3),
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing(3) },
  hello: { color: colors.text, fontSize: 18, fontWeight: '800' },
  gear: { fontSize: 22 },
  stepsCard: { gap: spacing(3) },
  stepsTop: { flexDirection: 'row', alignItems: 'center', gap: spacing(3) },
  shoe: { fontSize: 40 },
  stepsInfo: { flex: 1, gap: spacing(1) },
  stepsNumber: { fontSize: 26, color: colors.lime },
  stepsMetaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  manualBox: {
    borderTopWidth: 2,
    borderTopColor: colors.borderSoft,
    paddingTop: spacing(3),
    gap: spacing(3),
  },
  manualText: { fontSize: 12 },
  manualButtons: { flexDirection: 'row', gap: spacing(2) },
  manualBtn: { flex: 1, minHeight: 42 },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing(2),
    marginTop: spacing(4),
  },
  weekItem: { flex: 1, alignItems: 'center', gap: spacing(1.5) },
  weekBarTrack: {
    width: '100%',
    height: 56,
    backgroundColor: colors.cardAlt,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.borderSoft,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  weekBarFill: { width: '100%' },
  weekLabel: { fontSize: 11 },
  section: { marginTop: spacing(6) },
  friendsRow: { gap: spacing(4), paddingRight: spacing(4) },
  friend: { alignItems: 'center', gap: spacing(1), width: 68 },
  friendName: { color: colors.text, fontSize: 12, fontWeight: '700' },
  friendSteps: { color: colors.lime, fontSize: 12, fontWeight: '800' },
  addFriend: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addFriendIcon: { color: colors.textSoft, fontSize: 24, fontWeight: '800' },
  tournamentCard: { marginTop: spacing(6), gap: spacing(3) },
  tournamentTop: { flexDirection: 'row', alignItems: 'center', gap: spacing(3) },
  trophy: { fontSize: 30 },
  tournamentName: { color: colors.text, fontSize: 16, fontWeight: '800' },
  podium: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 2,
    borderTopColor: colors.borderSoft,
    paddingTop: spacing(3),
  },
  podiumItem: { alignItems: 'center', gap: spacing(1), width: 86 },
  podiumName: { color: colors.textSoft, fontSize: 12, fontWeight: '700' },
  podiumSteps: { color: colors.text, fontSize: 13, fontWeight: '800' },
  mapCard: { padding: spacing(3), gap: spacing(3) },
  mapWrap: { height: 180, borderRadius: radius.md, overflow: 'hidden' },
  mapEmpty: { textAlign: 'center', paddingVertical: spacing(3) },
});
