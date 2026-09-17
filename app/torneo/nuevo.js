import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import PixelIcon from '../../src/components/PixelIcon';
import {
  Avatar,
  Button,
  Caption,
  IconButton,
  Muted,
  Panel,
  Screen,
  SectionHeader,
} from '../../src/components/ui';
import { ME, useStore } from '../../src/state/store';
import { colors, spacing, type } from '../../src/theme';
import { addDays, startOfDay } from '../../src/utils/dates';
import { inviteCode, randomId } from '../../src/utils/geo';
import { arcade } from '../../src/utils/format';

const ICONS = ['trophy', 'shoe', 'flame', 'star', 'crown', 'target', 'skull', 'food'];
const DURATIONS = [
  { id: 3, label: '3 días' },
  { id: 7, label: '1 semana' },
  { id: 14, label: '2 semanas' },
  { id: 30, label: '1 mes' },
];
const PRIZES = [
  'El último del ranking paga el café',
  'El ganador elige dónde comemos',
  'El último invita el helado',
  'Sin premio, sólo el récord',
];

export default function NuevoTorneo() {
  const router = useRouter();
  const { friends, createTournament } = useStore();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('trophy');
  const [days, setDays] = useState(7);
  const [prize, setPrize] = useState(PRIZES[0]);
  const [custom, setCustom] = useState('');
  const [selected, setSelected] = useState(friends.map((f) => f.id));

  const toggle = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const create = () => {
    const start = startOfDay(new Date());
    const tournament = {
      id: randomId('trn'),
      name: name.trim() || `Torneo de ${days} días`,
      icon,
      prize: custom.trim() || prize,
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
      <View style={styles.topBar}>
        <IconButton icon="chevron" flip onPress={() => router.back()} />
        <Text style={[type.title, styles.title]}>NUEVO TORNEO</Text>
        <View style={{ width: 24 }} />
      </View>

      <Panel style={styles.block}>
        <SectionHeader title="Identidad" color={colors.lime} />
        <Caption>Nombre</Caption>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Liga de la semana"
          placeholderTextColor={colors.textFaint}
          style={styles.input}
          maxLength={22}
        />
        <Caption>Emblema</Caption>
        <View style={styles.iconRow}>
          {ICONS.map((i) => (
            <Pressable
              key={i}
              onPress={() => setIcon(i)}
              style={[styles.iconBox, i === icon && styles.iconBoxActive]}
            >
              <PixelIcon name={i} size={20} color={i === icon ? colors.bgDeep : colors.textDim} />
            </Pressable>
          ))}
        </View>
      </Panel>

      <Panel style={styles.block}>
        <SectionHeader title="Duración" color={colors.cyan} />
        <View style={styles.optionsRow}>
          {DURATIONS.map((d) => (
            <Pressable
              key={d.id}
              onPress={() => setDays(d.id)}
              style={[styles.option, days === d.id && styles.optionActive]}
            >
              <Text
                style={[
                  type.title,
                  { fontSize: 9, color: days === d.id ? colors.bgDeep : colors.textDim },
                ]}
              >
                {arcade(d.label)}
              </Text>
            </Pressable>
          ))}
        </View>
      </Panel>

      <Panel style={styles.block}>
        <SectionHeader title="Premio" color={colors.amber} />
        <View style={styles.prizes}>
          {PRIZES.map((p) => {
            const active = !custom.trim() && prize === p;
            return (
              <Pressable
                key={p}
                onPress={() => {
                  setPrize(p);
                  setCustom('');
                }}
                style={[styles.prize, active && styles.prizeActive]}
              >
                <PixelIcon
                  name={active ? 'check' : 'star'}
                  size={12}
                  color={active ? colors.amber : colors.textFaint}
                />
                <Text
                  style={[
                    type.small,
                    { flex: 1, color: active ? colors.amber : colors.textDim },
                  ]}
                >
                  {p}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <TextInput
          value={custom}
          onChangeText={setCustom}
          placeholder="O escribí el tuyo"
          placeholderTextColor={colors.textFaint}
          style={styles.input}
          maxLength={40}
        />
      </Panel>

      <Panel style={styles.block}>
        <SectionHeader title={`Jugadores (${selected.length + 1})`} color={colors.magenta} />
        {friends.length === 0 ? (
          <Muted>
            Todavía no tenés amigos agregados. Podés crear el torneo igual e invitarlos con el código.
          </Muted>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.friends}>
            {friends.map((f) => {
              const on = selected.includes(f.id);
              return (
                <Pressable key={f.id} onPress={() => toggle(f.id)} style={styles.friend}>
                  <Avatar avatar={f.avatar} size={50} active={on} />
                  <Text
                    style={[type.tiny, { color: on ? colors.lime : colors.textFaint }]}
                    numberOfLines={1}
                  >
                    {f.name.toUpperCase()}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </Panel>

      <Button label="Crear torneo" icon="trophy" size="lg" onPress={create} style={styles.cta} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: spacing(4) },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing(3),
  },
  title: { fontSize: 12, color: colors.text },
  block: { marginBottom: spacing(4), gap: spacing(2) },
  input: {
    backgroundColor: colors.bgDeep,
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2.5),
    color: colors.lime,
    fontFamily: type.label.fontFamily,
    fontSize: 14,
    letterSpacing: 0.5,
    marginBottom: spacing(2),
  },
  iconRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(2) },
  iconBox: {
    width: 42,
    height: 42,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.panelAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxActive: { backgroundColor: colors.lime, borderColor: colors.lime },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(2) },
  option: {
    flexGrow: 1,
    flexBasis: '45%',
    paddingVertical: spacing(3),
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.panelAlt,
    alignItems: 'center',
  },
  optionActive: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  prizes: { gap: spacing(2) },
  prize: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
    paddingVertical: spacing(2.5),
    paddingHorizontal: spacing(3),
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.panelAlt,
  },
  prizeActive: { borderColor: colors.amber },
  friends: { gap: spacing(3), paddingVertical: spacing(2) },
  friend: { alignItems: 'center', gap: spacing(1.5), width: 62 },
  cta: { marginBottom: spacing(8) },
});
