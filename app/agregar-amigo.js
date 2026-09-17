import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Avatar, Button, Card, Muted, Screen } from '../src/components/ui';
import { useStore } from '../src/state/store';
import { AVATARS } from '../src/data/demo';
import { colors, radius, spacing } from '../src/theme';
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
      Alert.alert('Falta el nombre', 'Poné cómo se llama tu amigo.');
      return;
    }
    if (cleanCode === profile.code) {
      Alert.alert('Ese sos vos', 'No podés agregarte a vos mismo.');
      return;
    }
    if (cleanCode && friends.some((f) => f.code === cleanCode)) {
      Alert.alert('Ya está', 'Ese amigo ya está en tu lista.');
      return;
    }
    // Historial vacío: se llena cuando tu amigo sincroniza sus pasos.
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
    Alert.alert('Listo', 'Tu código quedó copiado, mandáselo a tus amigos.');
  };

  return (
    <Screen scroll style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.back}>←</Text>
        </Pressable>
        <Text style={styles.title}>Agregar amigo</Text>
        <View style={{ width: 24 }} />
      </View>

      <Card style={styles.myCode} onPress={copyMine}>
        <View style={styles.flex}>
          <Muted>Tu código</Muted>
          <Text style={styles.code}>{profile.code}</Text>
        </View>
        <Text style={styles.copy}>📋</Text>
      </Card>

      <Muted style={styles.help}>
        Pedile el código a tu amigo y cargalo acá. Sus pasos aparecen cuando él
        también sincroniza desde su teléfono.
      </Muted>

      <Card style={styles.block}>
        <Text style={styles.label}>Código del amigo</Text>
        <TextInput
          value={code}
          onChangeText={(t) => setCode(t.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
          placeholder="ABC123"
          placeholderTextColor={colors.muted}
          style={[styles.input, styles.codeInput]}
          maxLength={6}
          autoCapitalize="characters"
        />
        <Text style={styles.label}>Nombre</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Tomi"
          placeholderTextColor={colors.muted}
          style={styles.input}
          maxLength={18}
        />
        <Text style={styles.label}>Avatar</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.avatars}>
          {AVATARS.map((a) => (
            <Pressable key={a} onPress={() => setAvatar(a)}>
              <Avatar emoji={a} size={48} active={a === avatar} />
            </Pressable>
          ))}
        </ScrollView>
      </Card>

      <Button label="Agregar" icon="+" onPress={add} />
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
  back: { color: colors.text, fontSize: 24, fontWeight: '800' },
  title: { color: colors.text, fontSize: 18, fontWeight: '800' },
  myCode: { flexDirection: 'row', alignItems: 'center', gap: spacing(3) },
  code: { color: colors.lime, fontSize: 24, fontWeight: '900', letterSpacing: 4, marginTop: 2 },
  copy: { fontSize: 22 },
  help: { marginTop: spacing(4), marginBottom: spacing(2) },
  block: { marginVertical: spacing(4), gap: spacing(2) },
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
  codeInput: { fontSize: 20, letterSpacing: 6, textAlign: 'center' },
  avatars: { gap: spacing(3), paddingVertical: spacing(2) },
});
