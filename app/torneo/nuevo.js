import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar, Button, Card, Muted, Screen, SectionHeader } from '../../src/components/ui';
import { ME, useStore } from '../../src/state/store';
import { colors, radius, spacing } from '../../src/theme';
import { addDays, startOfDay } from '../../src/utils/dates';
import { inviteCode, randomId } from '../../src/utils/geo';

const EMOJIS = ['🏆', '👟', '🔥', '⚡', '🥇', '🚀', '🎯', '🍕'];
const DURATIONS = [
  { id: 3, label: '3 días' },
  { id: 7, label: '1 semana' },
  { id: 14, label: '2 semanas' },
  { id: 30, label: '1 mes' },
];
const PRIZES = [
  'El último paga el café ☕',
  'El ganador elige dónde comemos 🍽️',
  'El último invita el helado 🍦',
  'Sin premio, sólo gloria 🏅',
];

export default function NuevoTorneo() {
  const router = useRouter();
  const { friends, createTournament } = useStore();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🏆');
  const [days, setDays] = useState(7);
  const [prize, setPrize] = useState(PRIZES[0]);
  const [selected, setSelected] = useState(friends.map((f) => f.id));

  const toggle = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const create = () => {
    const start = startOfDay(new Date());
    const tournament = {
      id: randomId('trn'),
      name: name.trim() || `Torneo de ${days} días`,
      emoji,
      prize,
      code: inviteCode(),
      startISO: start.toISOString(),
      endISO: addDays(start, days).toISOString(),
      createdBy: ME,
      participantIds: [ME, ...selected],
    };
    createTournament(tournament);
    router.replace(`/torneo/${tournament.id}`);
  };

  return (
    <Screen scroll style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.back}>←</Text>
        </Pressable>
        <Text style={styles.title}>Nuevo torneo</Text>
        <View style={{ width: 24 }} />
      </View>

      <Card style={styles.block}>
        <Text style={styles.label}>Nombre</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Liga de la semana"
          placeholderTextColor={colors.muted}
          style={styles.input}
          maxLength={28}
        />
        <Text style={styles.label}>Ícono</Text>
        <View style={styles.emojiRow}>
          {EMOJIS.map((e) => (
            <Pressable
              key={e}
              onPress={() => setEmoji(e)}
              style={[styles.emoji, e === emoji && styles.emojiActive]}
            >
              <Text style={styles.emojiText}>{e}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card style={styles.block}>
        <Text style={styles.label}>¿Cuánto dura?</Text>
        <View style={styles.optionsRow}>
          {DURATIONS.map((d) => (
            <Pressable
              key={d.id}
              onPress={() => setDays(d.id)}
              style={[styles.option, days === d.id && styles.optionActive]}
            >
              <Text style={[styles.optionText, days === d.id && styles.optionTextActive]}>
                {d.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card style={styles.block}>
        <Text style={styles.label}>Premio / castigo</Text>
        <View style={styles.prizes}>
          {PRIZES.map((p) => (
            <Pressable
              key={p}
              onPress={() => setPrize(p)}
              style={[styles.prize, prize === p && styles.prizeActive]}
            >
              <Text style={[styles.prizeText, prize === p && styles.prizeTextActive]}>{p}</Text>
            </Pressable>
          ))}
        </View>
        <TextInput
          value={PRIZES.includes(prize) ? '' : prize}
          onChangeText={setPrize}
          placeholder="O escribí el tuyo…"
          placeholderTextColor={colors.muted}
          style={styles.input}
          maxLength={44}
        />
      </Card>

      <Card style={styles.block}>
        <SectionHeader title={`Participantes (${selected.length + 1})`} />
        {friends.length === 0 ? (
          <Muted>Todavía no tenés amigos agregados. Podés crear el torneo igual e invitarlos con el código.</Muted>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.friends}>
            {friends.map((f) => (
              <Pressable key={f.id} onPress={() => toggle(f.id)} style={styles.friend}>
                <Avatar emoji={f.avatar} size={52} active={selected.includes(f.id)} />
                <Text
                  style={[
                    styles.friendName,
                    selected.includes(f.id) && { color: colors.lime },
                  ]}
                >
                  {f.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </Card>

      <Button label="Crear torneo" icon="🏆" onPress={create} style={styles.cta} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: spacing(4) },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing(3),
  },
  back: { color: colors.text, fontSize: 24, fontWeight: '800' },
  title: { color: colors.text, fontSize: 18, fontWeight: '800' },
  block: { marginBottom: spacing(4), gap: spacing(2) },
  label: { color: colors.text, fontSize: 13, fontWeight: '800', marginTop: spacing(1) },
  input: {
    backgroundColor: colors.bgDeep,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2.5),
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  emojiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(2) },
  emoji: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiActive: { borderColor: colors.lime, backgroundColor: 'rgba(200,247,81,0.12)' },
  emojiText: { fontSize: 20 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(2) },
  option: {
    flexGrow: 1,
    paddingVertical: spacing(2.5),
    paddingHorizontal: spacing(3),
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.cardAlt,
    alignItems: 'center',
  },
  optionActive: { borderColor: colors.lime, backgroundColor: colors.lime },
  optionText: { color: colors.textSoft, fontWeight: '800', fontSize: 13 },
  optionTextActive: { color: '#0A1020' },
  prizes: { gap: spacing(2) },
  prize: {
    paddingVertical: spacing(2.5),
    paddingHorizontal: spacing(3),
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.cardAlt,
  },
  prizeActive: { borderColor: colors.lime },
  prizeText: { color: colors.textSoft, fontWeight: '700', fontSize: 13 },
  prizeTextActive: { color: colors.lime },
  friends: { gap: spacing(3), paddingVertical: spacing(1) },
  friend: { alignItems: 'center', gap: spacing(1), width: 64 },
  friendName: { color: colors.textSoft, fontSize: 12, fontWeight: '700' },
  cta: { marginBottom: spacing(8) },
});
