import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import PixelIcon from '../src/components/PixelIcon';
import {
  Avatar,
  Button,
  Caption,
  IconButton,
  Muted,
  Panel,
  Score,
  Screen,
  SectionHeader,
} from '../src/components/ui';
import { useStore } from '../src/state/store';
import { AVATARS } from '../src/data/demo';
import { colors, spacing, type } from '../src/theme';
import { dayKey, addDays } from '../src/utils/dates';
import { randomId } from '../src/utils/geo';

export default function AgregarAmigo() {
  const router = useRouter();
  const { profile, friends, addFriend } = useStore();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[1]);

  const add = () => {
    const cleanCode = code.trim().toUpperCase();
    const cleanName = name.trim();
    if (cleanName.length < 2) {
      Alert.alert('Falta el nombre', 'Escribí cómo se llama tu amigo.');
      return;
    }
    if (cleanCode === profile.code) {
      Alert.alert('Ese sos vos', 'No podés agregarte a vos mismo.');
      return;
    }
    if (cleanCode && friends.some((f) => f.code === cleanCode)) {
      Alert.alert('Ya está en la lista', 'Ese jugador ya figura entre tus amigos.');
      return;
    }
    const history = {};
    for (let i = 0; i < 7; i += 1) history[dayKey(addDays(new Date(), -i))] = 0;
    addFriend({
      id: randomId('friend'),
      name: cleanName,
      avatar,
      code: cleanCode || randomId('code').toUpperCase().slice(-6),
      history,
    });
    router.back();
  };

  const copyMine = async () => {
    await Clipboard.setStringAsync(profile.code);
    Alert.alert('Listo', 'Tu código quedó copiado. Mandáselo a tus amigos.');
  };

  return (
    <Screen scroll style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <IconButton icon="chevron" flip onPress={() => router.back()} />
        <Text style={[type.title, styles.title]}>SUMAR JUGADOR</Text>
        <View style={{ width: 24 }} />
      </View>

      <Panel tone="cyan" style={styles.myCode} onPress={copyMine}>
        <View style={styles.flex}>
          <Caption color={colors.cyan}>Tu código</Caption>
          <Score style={styles.code}>{profile.code}</Score>
        </View>
        <View style={styles.copyBox}>
          <PixelIcon name="clipboard" size={20} color={colors.cyan} />
        </View>
      </Panel>

      <Muted style={styles.help}>
        Pedile el código a tu amigo y cargalo acá. Sus pasos aparecen cuando él
        también sincroniza desde su teléfono.
      </Muted>

      <Panel style={styles.block}>
        <SectionHeader title="Datos del jugador" color={colors.magenta} />
        <Caption>Código</Caption>
        <TextInput
          value={code}
          onChangeText={(t) => setCode(t.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
          placeholder="ABC123"
          placeholderTextColor={colors.textFaint}
          style={[styles.input, styles.codeInput]}
          maxLength={6}
          autoCapitalize="characters"
        />
        <Caption>Nombre</Caption>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Tomi"
          placeholderTextColor={colors.textFaint}
          style={styles.input}
          maxLength={14}
        />
        <Caption>Personaje</Caption>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.avatars}>
          {AVATARS.map((a) => (
            <Pressable key={a.id} onPress={() => setAvatar(a)}>
              <Avatar avatar={a} size={48} active={a.id === avatar.id} />
            </Pressable>
          ))}
        </ScrollView>
      </Panel>

      <Button label="Agregar" icon="plus" size="lg" onPress={add} style={styles.cta} />
    </Screen>
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
  title: { fontSize: 12, color: colors.text },
  myCode: { flexDirection: 'row', alignItems: 'center', gap: spacing(3) },
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
  help: { marginTop: spacing(4), marginBottom: spacing(2), lineHeight: 17 },
  block: { marginVertical: spacing(4), gap: spacing(2) },
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
  codeInput: { fontSize: 20, letterSpacing: 6, textAlign: 'center' },
  avatars: { gap: spacing(3), paddingVertical: spacing(2) },
  cta: { marginBottom: spacing(8) },
});
