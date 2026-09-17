import React, { useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  Avatar,
  Badge,
  Body,
  Button,
  Card,
  Divider,
  Muted,
  PixelText,
  Screen,
  SectionHeader,
} from '../../src/components/ui';
import { useSteps } from '../../src/state/steps';
import { openHealthConnect } from '../../src/services/steps';
import { useStore } from '../../src/state/store';
import { AVATARS } from '../../src/data/demo';
import { colors, radius, spacing } from '../../src/theme';
import { dayKey, lastNDays, shortWeekday } from '../../src/utils/dates';
import { formatNumber, stepsToKcal, stepsToKm } from '../../src/utils/format';

export default function Perfil() {
  const { profile, history, setProfile, addSteps, reset, favorites } = useStore();
  const { support, backgroundEnabled, syncing, lastSync, sync, connect, error } = useSteps();
  const [name, setName] = useState(profile.name);
  const [goal, setGoal] = useState(String(profile.goal));
  const [manual, setManual] = useState('');

  const stats = useMemo(() => {
    const days = lastNDays(30);
    const values = days.map((d) => history[d] || 0);
    const total = values.reduce((a, b) => a + b, 0);
    const active = values.filter((v) => v > 0).length;
    const best = Math.max(0, ...values);
    const goalsHit = values.filter((v) => v >= profile.goal).length;
    return { total, best, average: active ? Math.round(total / active) : 0, goalsHit };
  }, [history, profile.goal]);

  const week = lastNDays(7).map((d) => ({ key: d, steps: history[d] || 0 }));

  const saveName = () => setProfile({ name: name.trim() || 'Caminante' });
  const saveGoal = () => {
    const parsed = Math.max(1000, Math.min(50000, parseInt(goal, 10) || 10000));
    setGoal(String(parsed));
    setProfile({ goal: parsed });
  };

  const confirmReset = () => {
    Alert.alert('Borrar todo', 'Se borran tu perfil, amigos y torneos de este teléfono.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Borrar', style: 'destructive', onPress: reset },
    ]);
  };

  return (
    <Screen scroll style={styles.screen}>
      <View style={styles.header}>
        <Avatar emoji={profile.avatar} size={64} active />
        <View style={styles.flex}>
          <PixelText style={styles.name}>{profile.name || 'Caminante'}</PixelText>
          <Muted>Código {profile.code}</Muted>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <Stat label="Pasos 30 días" value={formatNumber(stats.total)} />
        <Stat label="Promedio" value={formatNumber(stats.average)} />
        <Stat label="Mejor día" value={formatNumber(stats.best)} />
        <Stat label="Metas logradas" value={`${stats.goalsHit}`} />
      </View>

      <Card style={styles.block}>
        <SectionHeader title="Conteo de pasos" />
        <View style={styles.statusRow}>
          <Badge
            label={backgroundEnabled ? 'Segundo plano activo' : 'Sólo con la app abierta'}
            color={backgroundEnabled ? colors.lime : colors.orange}
          />
          {syncing ? <Muted>sincronizando…</Muted> : null}
        </View>
        <Body style={styles.statusText}>{support?.label || 'Verificando sensor…'}</Body>
        <Muted style={styles.batteryNote}>
          🔋 No corremos nada en segundo plano: leemos el conteo que el propio
          teléfono ya guarda, así que el consumo extra de batería es casi nulo.
        </Muted>
        {error ? <Muted style={styles.error}>{error}</Muted> : null}

        <View style={styles.buttonsRow}>
          <Button
            label="Sincronizar"
            icon="🔄"
            variant="dark"
            style={styles.flexBtn}
            loading={syncing}
            onPress={() => sync(7)}
          />
          {!backgroundEnabled && Platform.OS !== 'web' ? (
            <Button label="Conectar" icon="🔗" style={styles.flexBtn} onPress={connect} />
          ) : null}
        </View>
        {Platform.OS === 'android' && support?.mode === 'health-connect' ? (
          <Pressable onPress={openHealthConnect}>
            <Text style={styles.link}>Abrir ajustes de Health Connect →</Text>
          </Pressable>
        ) : null}
        {lastSync ? (
          <Muted style={styles.syncNote}>
            Última sincronización: {lastSync.toLocaleTimeString()}
          </Muted>
        ) : null}
      </Card>

      <Card style={styles.block}>
        <SectionHeader title="Tu semana" />
        <View style={styles.weekRow}>
          {week.map((d) => {
            const max = Math.max(profile.goal, ...week.map((x) => x.steps));
            return (
              <View key={d.key} style={styles.weekItem}>
                <View style={styles.weekTrack}>
                  <View
                    style={[
                      styles.weekFill,
                      {
                        height: `${Math.max(4, (d.steps / max) * 100)}%`,
                        backgroundColor:
                          d.steps >= profile.goal ? colors.lime : colors.blue,
                      },
                    ]}
                  />
                </View>
                <Muted style={styles.weekLabel}>{shortWeekday(d.key)}</Muted>
              </View>
            );
          })}
        </View>
        <Divider style={{ marginVertical: spacing(3) }} />
        <Muted>
          Hoy: {formatNumber(history[dayKey()] || 0)} pasos ·{' '}
          {stepsToKm(history[dayKey()] || 0).toFixed(2).replace('.', ',')} km ·{' '}
          {stepsToKcal(history[dayKey()] || 0)} kcal
        </Muted>
      </Card>

      <Card style={styles.block}>
        <SectionHeader title="Tus datos" />
        <Text style={styles.label}>Nombre</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          onBlur={saveName}
          style={styles.input}
          maxLength={18}
          placeholderTextColor={colors.muted}
        />
        <Text style={styles.label}>Meta diaria</Text>
        <TextInput
          value={goal}
          onChangeText={(t) => setGoal(t.replace(/[^0-9]/g, ''))}
          onBlur={saveGoal}
          keyboardType="number-pad"
          style={styles.input}
          maxLength={5}
        />
        <Text style={styles.label}>Avatar</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.avatars}>
          {AVATARS.map((a) => (
            <Pressable key={a} onPress={() => setProfile({ avatar: a })}>
              <Avatar emoji={a} size={46} active={a === profile.avatar} />
            </Pressable>
          ))}
        </ScrollView>
      </Card>

      <Card style={styles.block}>
        <SectionHeader title="Cargar pasos a mano" />
        <Muted style={{ marginBottom: spacing(3) }}>
          Útil si saliste sin el teléfono o si estás usando la versión web.
        </Muted>
        <View style={styles.manualRow}>
          <TextInput
            value={manual}
            onChangeText={(t) => setManual(t.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={colors.muted}
            style={[styles.input, styles.manualInput]}
            maxLength={5}
          />
          <Button
            label="Sumar"
            style={styles.manualBtn}
            onPress={() => {
              const n = parseInt(manual, 10);
              if (n > 0) addSteps(n);
              setManual('');
            }}
          />
        </View>
      </Card>

      <Muted style={styles.favs}>❤️ {favorites.length} lugares guardados</Muted>
      <Button
        label="Borrar mis datos"
        variant="danger"
        onPress={confirmReset}
        style={{ marginTop: spacing(4) }}
      />
      <Muted style={styles.version}>Pasos v1.0.0</Muted>
    </Screen>
  );
}

function Stat({ label, value }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
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
    gap: spacing(4),
    paddingVertical: spacing(4),
  },
  name: { fontSize: 15, color: colors.lime, lineHeight: 22 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(3) },
  stat: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.borderSoft,
    padding: spacing(3),
    gap: 2,
  },
  statValue: { color: colors.text, fontSize: 18, fontWeight: '900' },
  statLabel: { fontSize: 11 },
  block: { marginTop: spacing(4), gap: spacing(2) },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(3) },
  statusText: { fontSize: 13 },
  batteryNote: { fontSize: 12, marginTop: spacing(1) },
  error: { color: colors.danger, fontSize: 12 },
  buttonsRow: { flexDirection: 'row', gap: spacing(3), marginTop: spacing(3) },
  flexBtn: { flex: 1, minHeight: 44 },
  link: { color: colors.lime, fontSize: 13, fontWeight: '700', marginTop: spacing(3) },
  syncNote: { fontSize: 11, marginTop: spacing(2) },
  weekRow: { flexDirection: 'row', gap: spacing(2) },
  weekItem: { flex: 1, alignItems: 'center', gap: spacing(1) },
  weekTrack: {
    width: '100%',
    height: 64,
    backgroundColor: colors.cardAlt,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.borderSoft,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  weekFill: { width: '100%' },
  weekLabel: { fontSize: 10 },
  label: { color: colors.text, fontSize: 13, fontWeight: '800', marginTop: spacing(2) },
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
  avatars: { gap: spacing(3), paddingVertical: spacing(2) },
  manualRow: { flexDirection: 'row', gap: spacing(3), alignItems: 'center' },
  manualInput: { flex: 1, textAlign: 'center', fontSize: 18 },
  manualBtn: { minHeight: 46, paddingHorizontal: spacing(5) },
  favs: { textAlign: 'center', marginTop: spacing(5) },
  version: { textAlign: 'center', marginTop: spacing(4), fontSize: 11 },
});
