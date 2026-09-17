import React, { useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import PixelIcon from '../../src/components/PixelIcon';
import {
  Avatar,
  Badge,
  Body,
  Button,
  Caption,
  Divider,
  Muted,
  Panel,
  Score,
  Screen,
  SectionHeader,
} from '../../src/components/ui';
import { useSteps } from '../../src/state/steps';
import { useSync } from '../../src/state/sync';
import { probarServidor, normalizarServidor } from '../../src/services/sync';
import { openHealthConnect } from '../../src/services/steps';
import { useStore } from '../../src/state/store';
import { AVATARS } from '../../src/data/demo';
import { colors, spacing, type } from '../../src/theme';
import { dayKey, lastNDays, shortWeekday } from '../../src/utils/dates';
import { formatNumber, stepsToKcal, stepsToKm, arcade } from '../../src/utils/format';

export default function Perfil() {
  const { profile, history, settings, setProfile, setSettings, addSteps, reset, favorites } = useStore();
  const grupo = useSync();
  const [servidor, setServidor] = useState(settings?.servidor || '');
  const [probando, setProbando] = useState(false);
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
  const weekMax = Math.max(profile.goal, ...week.map((x) => x.steps));
  const today = history[dayKey()] || 0;

  const saveName = () => setProfile({ name: name.trim() || 'Jugador 1' });
  const saveGoal = () => {
    const parsed = Math.max(1000, Math.min(50000, parseInt(goal, 10) || 10000));
    setGoal(String(parsed));
    setProfile({ goal: parsed });
  };

  const guardarServidor = async () => {
    const url = normalizarServidor(servidor);
    if (!url) {
      setSettings({ servidor: '' });
      setServidor('');
      Alert.alert('Sincronización apagada', 'La app vuelve a funcionar solo con tus datos.');
      return;
    }
    setProbando(true);
    try {
      await probarServidor(url);
      setSettings({ servidor: url });
      setServidor(url);
      Alert.alert(
        'Conectado',
        'Los torneos se sincronizan solos. Pasale el código de invitación a tus amigos y, cuando entren con la misma dirección, aparecen en la tabla.',
      );
    } catch (err) {
      Alert.alert('No se pudo conectar', err?.message || 'Revisá la dirección.');
    } finally {
      setProbando(false);
    }
  };

  const confirmReset = () => {
    Alert.alert('Borrar la partida', 'Se borran tu perfil, amigos y torneos de este teléfono.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Borrar', style: 'destructive', onPress: reset },
    ]);
  };

  return (
    <Screen scroll style={styles.screen}>
      <View style={styles.header}>
        <Avatar avatar={profile.avatar} size={62} active />
        <View style={styles.flex}>
          <Caption color={colors.cyan}>Jugador</Caption>
          <Text style={[type.title, styles.name]} numberOfLines={1}>
            {arcade(profile.name || 'Jugador 1')}
          </Text>
          <Muted>CÓDIGO {profile.code}</Muted>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <Stat label="Pasos 30 días" value={formatNumber(stats.total)} color={colors.lime} />
        <Stat label="Promedio diario" value={formatNumber(stats.average)} color={colors.cyan} />
        <Stat label="Mejor jornada" value={formatNumber(stats.best)} color={colors.magenta} />
        <Stat label="Metas logradas" value={`${stats.goalsHit}`} color={colors.gold} />
      </View>

      {/* Sensor */}
      <Panel style={styles.block} tone={backgroundEnabled ? 'neon' : 'default'}>
        <SectionHeader title="Sensor de pasos" color={backgroundEnabled ? colors.lime : colors.amber} />
        <View style={styles.statusRow}>
          <Badge
            label={backgroundEnabled ? 'Segundo plano activo' : 'Sólo con la app abierta'}
            color={backgroundEnabled ? colors.lime : colors.amber}
            icon={backgroundEnabled ? 'check' : 'clock'}
          />
        </View>
        <Body style={styles.statusText}>{support?.label || 'Verificando sensor…'}</Body>

        <View style={styles.batteryRow}>
          <PixelIcon name="battery" size={16} color={colors.lime} />
          <Muted style={styles.batteryNote}>
            No corremos procesos en segundo plano: leemos el conteo que el propio
            teléfono ya guarda. El consumo extra de batería es prácticamente nulo.
          </Muted>
        </View>

        {error ? <Muted style={styles.error}>{error}</Muted> : null}

        <View style={styles.buttonsRow}>
          <Button
            label="Sincronizar"
            icon="clock"
            variant="dark"
            size="sm"
            style={styles.flexBtn}
            loading={syncing}
            onPress={() => sync(7)}
          />
          {!backgroundEnabled && Platform.OS !== 'web' ? (
            <Button label="Conectar" icon="check" size="sm" style={styles.flexBtn} onPress={connect} />
          ) : null}
        </View>
        {Platform.OS === 'android' && support?.mode === 'health-connect' ? (
          <Pressable onPress={openHealthConnect} style={styles.link}>
            <Text style={[type.tiny, { color: colors.lime, letterSpacing: 0.6 }]}>
              ABRIR AJUSTES DE HEALTH CONNECT
            </Text>
            <PixelIcon name="chevron" size={10} color={colors.lime} />
          </Pressable>
        ) : null}
        {lastSync ? (
          <Muted style={styles.syncNote}>
            Última sincronización: {lastSync.toLocaleTimeString()}
          </Muted>
        ) : null}
      </Panel>

      {/* Semana */}
      <Panel style={styles.block} tone="dark">
        <SectionHeader title="Tu semana" color={colors.cyan} />
        <View style={styles.weekRow}>
          {week.map((d) => {
            const hit = d.steps >= profile.goal;
            return (
              <View key={d.key} style={styles.weekItem}>
                <View style={styles.weekTrack}>
                  <View
                    style={[
                      styles.weekFill,
                      {
                        height: `${Math.max(3, (d.steps / weekMax) * 100)}%`,
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
        <Divider style={{ marginVertical: spacing(3) }} />
        <View style={styles.todayRow}>
          <PixelIcon name="shoe" size={14} color={colors.lime} />
          <Muted>
            HOY {formatNumber(today)} · {stepsToKm(today).toFixed(2).replace('.', ',')} KM ·{' '}
            {stepsToKcal(today)} KCAL
          </Muted>
        </View>
      </Panel>

      {/* Grupo compartido */}
      <Panel style={styles.block} tone={grupo.activo ? 'cyan' : 'default'}>
        <SectionHeader title="Grupo compartido" color={colors.cyan} />
        <Muted style={{ marginBottom: spacing(2) }}>
          Sin servidor, cada teléfono guarda sus propios pasos y nadie ve los
          del resto. Con uno, todos los que entren con el mismo código de
          torneo aparecen en la misma tabla.
        </Muted>
        <Caption>Dirección del servidor</Caption>
        <TextInput
          value={servidor}
          onChangeText={setServidor}
          placeholder="https://mi-servidor.com"
          placeholderTextColor={colors.textFaint}
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
        <View style={styles.buttonsRow}>
          <Button
            label={servidor.trim() ? 'Conectar' : 'Apagar'}
            icon="globe"
            size="sm"
            style={styles.flexBtn}
            loading={probando}
            onPress={guardarServidor}
          />
          {grupo.activo ? (
            <Button
              label="Sincronizar"
              icon="clock"
              variant="dark"
              size="sm"
              style={styles.flexBtn}
              loading={grupo.estado === 'sincronizando'}
              onPress={grupo.sincronizar}
            />
          ) : null}
        </View>
        <View style={{ marginTop: spacing(3) }}>
          <Badge
            label={
              !grupo.activo
                ? 'Solo este teléfono'
                : grupo.estado === 'error'
                  ? 'Error al sincronizar'
                  : grupo.estado === 'ok'
                    ? 'Sincronizado'
                    : 'Conectando'
            }
            color={
              !grupo.activo ? colors.textFaint : grupo.estado === 'error' ? colors.red : colors.cyan
            }
            icon={grupo.estado === 'ok' ? 'check' : 'globe'}
          />
        </View>
        {grupo.error ? <Muted style={styles.error}>{grupo.error}</Muted> : null}
        {grupo.ultima ? (
          <Muted style={styles.syncNote}>Al día: {grupo.ultima.toLocaleTimeString()}</Muted>
        ) : null}
      </Panel>

      {/* Datos */}
      <Panel style={styles.block}>
        <SectionHeader title="Tus datos" color={colors.magenta} />
        <Caption>Nombre</Caption>
        <TextInput
          value={name}
          onChangeText={setName}
          onBlur={saveName}
          style={styles.input}
          maxLength={14}
          placeholderTextColor={colors.textFaint}
        />
        <Caption>Meta diaria</Caption>
        <TextInput
          value={goal}
          onChangeText={(t) => setGoal(t.replace(/[^0-9]/g, ''))}
          onBlur={saveGoal}
          keyboardType="number-pad"
          style={styles.input}
          maxLength={5}
        />
        <Caption>Personaje</Caption>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.avatars}>
          {AVATARS.map((a) => (
            <Pressable key={a.id} onPress={() => setProfile({ avatar: a })}>
              <Avatar avatar={a} size={46} active={a.id === profile.avatar?.id} />
            </Pressable>
          ))}
        </ScrollView>
      </Panel>

      {/* Carga manual */}
      <Panel style={styles.block} tone="dark">
        <SectionHeader title="Carga manual" color={colors.amber} />
        <Muted style={{ marginBottom: spacing(3) }}>
          Útil si saliste sin el teléfono o si estás usando la versión web.
        </Muted>
        <View style={styles.manualRow}>
          <TextInput
            value={manual}
            onChangeText={(t) => setManual(t.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={colors.textFaint}
            style={[styles.input, styles.manualInput]}
            maxLength={5}
          />
          <Button
            label="Sumar"
            icon="plus"
            size="sm"
            style={styles.manualBtn}
            onPress={() => {
              const n = parseInt(manual, 10);
              if (n > 0) addSteps(n);
              setManual('');
            }}
          />
        </View>
      </Panel>

      <View style={styles.favsRow}>
        <PixelIcon name="heart" size={14} color={colors.magenta} />
        <Muted>{favorites.length} LUGARES GUARDADOS</Muted>
      </View>

      <Button
        label="Borrar mis datos"
        icon="trash"
        variant="danger"
        onPress={confirmReset}
        style={{ marginTop: spacing(4) }}
      />
      <Muted style={styles.version}>PASOS v1.0.0</Muted>
    </Screen>
  );
}

function Stat({ label, value, color }) {
  return (
    <Panel tone="dark" style={styles.stat} shadow={false}>
      <Score small style={{ color }}>
        {value}
      </Score>
      <Caption color={colors.textFaint}>{label}</Caption>
    </Panel>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: spacing(4) },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(4),
    paddingVertical: spacing(5),
  },
  name: { fontSize: 14, color: colors.lime, marginVertical: 5 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(3) },
  stat: { flexBasis: '47%', flexGrow: 1, padding: spacing(3), gap: spacing(2) },
  block: { marginTop: spacing(5), gap: spacing(2) },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(3) },
  statusText: { fontSize: 12, marginTop: spacing(1) },
  batteryRow: { flexDirection: 'row', gap: spacing(2), marginTop: spacing(2) },
  batteryNote: { flex: 1, fontSize: 10, lineHeight: 15 },
  error: { color: colors.red, fontSize: 11, marginTop: spacing(2) },
  buttonsRow: { flexDirection: 'row', gap: spacing(3), marginTop: spacing(4) },
  flexBtn: { flex: 1 },
  link: { flexDirection: 'row', alignItems: 'center', gap: spacing(2), marginTop: spacing(4) },
  syncNote: { fontSize: 10, marginTop: spacing(3) },
  weekRow: { flexDirection: 'row', gap: spacing(2), marginTop: spacing(2) },
  weekItem: { flex: 1, alignItems: 'center', gap: spacing(1.5) },
  weekTrack: {
    width: '100%',
    height: 58,
    backgroundColor: colors.bgDeep,
    borderWidth: 2,
    borderColor: colors.borderDim,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  weekFill: { width: '100%' },
  weekLabel: { color: colors.textFaint, fontSize: 9 },
  todayRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(2) },
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
  avatars: { gap: spacing(3), paddingVertical: spacing(2) },
  manualRow: { flexDirection: 'row', gap: spacing(3), alignItems: 'flex-start' },
  manualInput: { flex: 1, minWidth: 0, textAlign: 'center', fontSize: 18, marginBottom: 0 },
  manualBtn: { minWidth: 110 },
  favsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing(2),
    marginTop: spacing(6),
  },
  version: { textAlign: 'center', marginTop: spacing(4), fontSize: 10 },
});
