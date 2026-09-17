import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar, Body, Button, Card, Muted, PixelText, Screen } from '../src/components/ui';
import { AVATARS } from '../src/data/demo';
import { useStore } from '../src/state/store';
import { colors, radius, spacing } from '../src/theme';

const FEATURES = [
  { icon: '👟', title: 'Cuenta\ntus pasos', text: 'El podómetro de tu teléfono, sin apps extra.' },
  { icon: '🏆', title: 'Torneos\ncon amigos', text: 'Rankings semanales y el que pierde invita.' },
  { icon: '🍽️', title: 'Comida y café\ncerca', text: 'Mapa con los mejores lugares a la vuelta.' },
];

export default function Onboarding() {
  const router = useRouter();
  const { profile, finishOnboarding } = useStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(profile.name);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [goal, setGoal] = useState(String(profile.goal));

  const start = () => {
    const parsed = Math.max(1000, Math.min(50000, parseInt(goal, 10) || 10000));
    finishOnboarding({ name: name.trim() || 'Caminante', avatar, goal: parsed });
    router.replace('/');
  };

  if (step === 0) {
    return (
      <Screen scroll style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.hero}>
          <Text style={styles.shoe}>👟</Text>
          <PixelText style={styles.logo}>¡A</PixelText>
          <PixelText style={styles.logo}>caminar!</PixelText>
          <Body style={styles.tagline}>
            Da pasos, compartí el camino{'\n'}y descubrí buenos lugares.
          </Body>
        </View>

        <View style={styles.features}>
          {FEATURES.map((f) => (
            <View key={f.title} style={styles.feature}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Muted style={styles.featureText}>{f.text}</Muted>
            </View>
          ))}
        </View>

        <View style={styles.skyline}>
          <Text style={styles.skylineText}>🏙️🌳📍🌳🏙️</Text>
        </View>

        <Button
          label="Comenzar"
          icon="→"
          iconPosition="right"
          onPress={() => setStep(1)}
          style={styles.cta}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll style={styles.container} edges={['top', 'bottom']}>
      <PixelText style={styles.stepTitle}>Tu perfil</PixelText>
      <Body style={styles.stepText}>Así te van a ver tus amigos en el ranking.</Body>

      <Card style={styles.block}>
        <Text style={styles.label}>¿Cómo te llamás?</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Tu nombre"
          placeholderTextColor={colors.muted}
          style={styles.input}
          maxLength={18}
          returnKeyType="done"
        />
      </Card>

      <Card style={styles.block}>
        <Text style={styles.label}>Elegí tu avatar</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.avatars}>
          {AVATARS.map((a) => (
            <Pressable key={a} onPress={() => setAvatar(a)}>
              <Avatar emoji={a} size={52} active={a === avatar} />
            </Pressable>
          ))}
        </ScrollView>
      </Card>

      <Card style={styles.block}>
        <Text style={styles.label}>Meta diaria de pasos</Text>
        <View style={styles.goalRow}>
          <TextInput
            value={goal}
            onChangeText={(t) => setGoal(t.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            style={[styles.input, styles.goalInput]}
            maxLength={5}
          />
          <View style={styles.goalPresets}>
            {[6000, 8000, 10000, 12000].map((g) => (
              <Pressable key={g} onPress={() => setGoal(String(g))} style={styles.preset}>
                <Text style={styles.presetText}>{g / 1000}k</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Card>

      <Button label="¡Vamos!" icon="🚀" onPress={start} style={styles.cta} />
      <Muted style={styles.note}>
        Podés cambiar todo esto después desde tu perfil.
      </Muted>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing(5) },
  hero: { alignItems: 'center', paddingTop: spacing(6), gap: spacing(1) },
  shoe: { fontSize: 64, marginBottom: spacing(3) },
  logo: { fontSize: 30, color: colors.lime, lineHeight: 38 },
  tagline: { textAlign: 'center', marginTop: spacing(4), color: colors.textSoft },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing(2),
    marginTop: spacing(8),
  },
  feature: { flex: 1, alignItems: 'center', gap: spacing(1.5) },
  featureIcon: { fontSize: 30 },
  featureTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  featureText: { textAlign: 'center', fontSize: 11 },
  skyline: { alignItems: 'center', marginVertical: spacing(8) },
  skylineText: { fontSize: 30, letterSpacing: 2 },
  cta: { marginTop: spacing(4) },
  stepTitle: { fontSize: 18, color: colors.lime, marginTop: spacing(6), lineHeight: 26 },
  stepText: { marginTop: spacing(3), marginBottom: spacing(5) },
  block: { marginBottom: spacing(4), gap: spacing(3) },
  label: { color: colors.text, fontSize: 14, fontWeight: '800' },
  input: {
    backgroundColor: colors.bgDeep,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(3),
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  avatars: { gap: spacing(3), paddingVertical: spacing(1) },
  goalRow: { gap: spacing(3) },
  goalInput: { textAlign: 'center', fontSize: 20 },
  goalPresets: { flexDirection: 'row', gap: spacing(2) },
  preset: {
    flex: 1,
    paddingVertical: spacing(2),
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.cardAlt,
  },
  presetText: { color: colors.textSoft, fontWeight: '800' },
  note: { textAlign: 'center', marginTop: spacing(4) },
});
