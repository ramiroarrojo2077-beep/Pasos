import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import PixelIcon from '../src/components/PixelIcon';
import {
  Avatar,
  Body,
  Button,
  Caption,
  Display,
  Muted,
  Panel,
  Screen,
  SegmentBar,
  Title,
} from '../src/components/ui';
import { AVATARS } from '../src/data/demo';
import { useStore } from '../src/state/store';
import { colors, spacing, type } from '../src/theme';
import { arcade } from '../src/utils/format';

const FEATURES = [
  { icon: 'shoe', title: 'Contá', text: 'El podómetro del teléfono.' },
  { icon: 'trophy', title: 'Competí', text: 'Torneos con tabla real.' },
  { icon: 'map', title: 'Descubrí', text: 'Cafés y comida cerca.' },
];

/** Parpadeo tipo "PRESS START" de los gabinetes. */
function Blink({ children }) {
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.15, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return <Animated.View style={{ opacity }}>{children}</Animated.View>;
}

export default function Onboarding() {
  const router = useRouter();
  const { profile, finishOnboarding } = useStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(profile.name);
  const [avatar, setAvatar] = useState(profile.avatar || AVATARS[0]);
  const [goal, setGoal] = useState(String(profile.goal));

  const start = () => {
    const parsed = Math.max(1000, Math.min(50000, parseInt(goal, 10) || 10000));
    finishOnboarding({ name: name.trim() || 'Jugador 1', avatar, goal: parsed });
    router.replace('/');
  };

  if (step === 0) {
    return (
      <Screen scroll style={styles.screen} edges={['top', 'bottom']}>
        <View style={styles.hero}>
          <Caption color={colors.cyan}>Arcade de caminata</Caption>
          <View style={styles.logoRow}>
            <PixelIcon name="shoe" size={56} color={colors.cyan} />
          </View>
          <Display style={styles.logo}>PASOS</Display>
          <View style={styles.rule} />
          <Body style={styles.tagline}>
            Sumá pasos, ganale a tus amigos y terminá la fecha en un buen café.
          </Body>
        </View>

        <View style={styles.features}>
          {FEATURES.map((f) => (
            <Panel key={f.title} style={styles.feature} tone="dark">
              <PixelIcon name={f.icon} size={28} color={colors.lime} />
              <Text style={[type.title, styles.featureTitle]}>{arcade(f.title)}</Text>
              <Muted style={styles.featureText}>{f.text}</Muted>
            </Panel>
          ))}
        </View>

        <Panel style={styles.marquee} tone="dark">
          <Caption color={colors.textFaint}>Récord de la casa</Caption>
          <View style={styles.marqueeRow}>
            <PixelIcon name="crown" size={16} color={colors.gold} />
            <Text style={[type.scoreSm, { color: colors.gold }]}>12.340</Text>
            <Text style={[type.small, { color: colors.textDim }]}>TOMI</Text>
          </View>
          <SegmentBar value={12340} max={14000} segments={20} height={12} color={colors.gold} />
        </Panel>

        <View style={styles.ctaWrap}>
          <Button label="Insertar ficha" icon="chevron" iconPosition="right" size="lg" onPress={() => setStep(1)} />
          <Blink>
            <Caption color={colors.lime}>Tocá para empezar</Caption>
          </Blink>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.stepHeader}>
        <Caption color={colors.cyan}>Paso 1 de 1</Caption>
        <Display style={styles.stepTitle}>JUGADOR</Display>
        <Body>Así te van a ver tus amigos en la tabla.</Body>
      </View>

      <Panel style={styles.block}>
        <Caption>Nombre</Caption>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Jugador 1"
          placeholderTextColor={colors.textFaint}
          style={styles.input}
          maxLength={14}
          returnKeyType="done"
        />
      </Panel>

      <Panel style={styles.block}>
        <Caption>Personaje</Caption>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.avatars}>
          {AVATARS.map((a) => (
            <Pressable key={a.id} onPress={() => setAvatar(a)}>
              <Avatar avatar={a} size={54} active={a.id === avatar.id} />
            </Pressable>
          ))}
        </ScrollView>
        <Muted>Deslizá para ver todos.</Muted>
      </Panel>

      <Panel style={styles.block}>
        <Caption>Meta diaria (pasos)</Caption>
        <TextInput
          value={goal}
          onChangeText={(t) => setGoal(t.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
          style={[styles.input, styles.goalInput]}
          maxLength={5}
        />
        <View style={styles.presets}>
          {[6000, 8000, 10000, 12000].map((g) => (
            <Pressable
              key={g}
              onPress={() => setGoal(String(g))}
              style={[styles.preset, String(g) === goal && styles.presetActive]}
            >
              <Text
                style={[
                  type.title,
                  { fontSize: 9, color: String(g) === goal ? colors.bgDeep : colors.textDim },
                ]}
              >
                {g / 1000}K
              </Text>
            </Pressable>
          ))}
        </View>
      </Panel>

      <Button label="Empezar partida" icon="chevron" iconPosition="right" size="lg" onPress={start} />
      <Muted style={styles.note}>Podés cambiar todo esto más adelante desde tu perfil.</Muted>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: spacing(4) },
  hero: { alignItems: 'center', paddingTop: spacing(6), gap: spacing(2) },
  logoRow: { marginTop: spacing(3) },
  logo: { fontSize: 38, letterSpacing: 2, marginTop: spacing(2) },
  rule: { width: 120, height: 3, backgroundColor: colors.magenta, marginVertical: spacing(3) },
  tagline: { textAlign: 'center', maxWidth: 300 },
  features: { flexDirection: 'row', gap: spacing(3), marginTop: spacing(7) },
  feature: { flex: 1, alignItems: 'center', gap: spacing(2), padding: spacing(3) },
  featureTitle: { fontSize: 9, color: colors.text, textAlign: 'center' },
  featureText: { textAlign: 'center', fontSize: 10, lineHeight: 15 },
  marquee: { marginTop: spacing(6), gap: spacing(2) },
  marqueeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(2) },
  ctaWrap: { marginTop: spacing(7), gap: spacing(4), alignItems: 'center' },
  stepHeader: { paddingTop: spacing(6), gap: spacing(2), marginBottom: spacing(5) },
  stepTitle: { fontSize: 26 },
  block: { marginBottom: spacing(4), gap: spacing(3) },
  input: {
    backgroundColor: colors.bgDeep,
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(3),
    color: colors.lime,
    fontFamily: type.label.fontFamily,
    fontSize: 15,
    letterSpacing: 0.5,
  },
  avatars: { gap: spacing(3), paddingVertical: spacing(1) },
  goalInput: { textAlign: 'center', fontSize: 20 },
  presets: { flexDirection: 'row', gap: spacing(2) },
  preset: {
    flex: 1,
    paddingVertical: spacing(2.5),
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.panelAlt,
  },
  presetActive: { backgroundColor: colors.lime, borderColor: colors.lime },
  note: { textAlign: 'center', marginTop: spacing(4), marginBottom: spacing(6) },
});
