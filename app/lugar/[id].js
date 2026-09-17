import React, { useMemo } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import PixelIcon from '../../src/components/PixelIcon';
import {
  Badge,
  Body,
  Button,
  Caption,
  Divider,
  IconButton,
  Muted,
  Panel,
  Screen,
} from '../../src/components/ui';
import PlacesMap from '../../src/components/PlacesMap';
import { CATEGORY_SPRITE } from '../../src/components/sprites';
import { usePlaces } from '../../src/state/places';
import { useStore } from '../../src/state/store';
import { colors, categoryColors, spacing, type } from '../../src/theme';
import { directionsUrl } from '../../src/utils/geo';
import { formatDistance, formatNumber, walkMinutes, arcade } from '../../src/utils/format';

export default function LugarDetalle() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { places, center } = usePlaces();
  const { favorites, toggleFavorite } = useStore();

  const place = useMemo(
    () => places.find((p) => p.id === decodeURIComponent(String(id))),
    [places, id],
  );

  if (!place) {
    return (
      <Screen style={styles.screen}>
        <IconButton icon="chevron" flip onPress={() => router.back()} />
        <Body style={styles.notFound}>No encontramos este lugar. Volvé al mapa y probá de nuevo.</Body>
      </Screen>
    );
  }

  const fav = favorites.includes(place.id);
  const tint = categoryColors[place.category] || colors.cyan;
  const minutes = walkMinutes(place.distance);
  const stepsAprox = place.distance ? Math.round(place.distance / 0.75) : null;

  const openMaps = () => Linking.openURL(directionsUrl(place)).catch(() => {});
  const share = async () => {
    await Clipboard.setStringAsync(`${place.name} — ${directionsUrl(place)}`);
  };

  return (
    <Screen scroll style={styles.screen}>
      <View style={styles.topBar}>
        <IconButton icon="chevron" flip onPress={() => router.back()} />
        <Caption color={colors.textFaint}>Ficha</Caption>
        <IconButton
          icon="heart"
          size={20}
          color={fav ? colors.magenta : colors.textFaint}
          onPress={() => toggleFavorite(place.id)}
        />
      </View>

      <Panel tone="dark" style={[styles.hero, { borderColor: tint }]}>
        <PixelIcon name={CATEGORY_SPRITE[place.category] || 'pin'} size={78} color={tint} />
      </Panel>

      <View style={styles.titleBlock}>
        <Text style={[type.title, styles.name]}>{arcade(place.name)}</Text>
        <Muted>{place.subtitle}</Muted>
      </View>

      <View style={styles.statsRow}>
        <Stat icon="pin" value={formatDistance(place.distance)} label="Distancia" color={colors.cyan} />
        <Stat icon="clock" value={minutes ? `${minutes} min` : '--'} label="Caminando" color={colors.lime} />
        <Stat
          icon="shoe"
          value={stepsAprox ? formatNumber(stepsAprox) : '--'}
          label="Pasos aprox"
          color={colors.magenta}
        />
      </View>

      {place.description ? <Body style={styles.description}>{place.description}</Body> : null}

      <View style={styles.tags}>
        {place.openingHours ? <Badge label={place.openingHours} color={colors.cyan} icon="clock" /> : null}
        {place.outdoor ? <Badge label="Mesas afuera" color={colors.lime} /> : null}
        {place.wifi ? <Badge label="Wi-Fi" color={colors.violet} icon="wifi" /> : null}
        {place.takeaway ? <Badge label="Para llevar" color={colors.amber} /> : null}
        {place.vegan ? <Badge label="Opciones veganas" color={colors.lime} /> : null}
      </View>

      <Button label="Cómo llegar" icon="navigate" size="lg" onPress={openMaps} style={styles.cta} />

      <Panel tone="dark" style={styles.mapCard}>
        <View style={styles.mapWrap}>
          <PlacesMap center={center} places={[place]} selectedId={place.id} showTag={false} />
        </View>
        {place.address ? (
          <View style={styles.addressRow}>
            <PixelIcon name="pin" size={12} color={colors.textFaint} />
            <Muted style={styles.address}>{place.address}</Muted>
          </View>
        ) : null}
      </Panel>

      <Panel style={styles.actionsCard}>
        {place.phone ? (
          <>
            <Action icon="phone" text={place.phone} onPress={() => Linking.openURL(`tel:${place.phone}`)} />
            <Divider />
          </>
        ) : null}
        {place.website ? (
          <>
            <Action icon="globe" text={place.website} onPress={() => Linking.openURL(place.website)} />
            <Divider />
          </>
        ) : null}
        <Action icon="share" text="Copiar link para mandarle a un amigo" onPress={share} />
      </Panel>

      <Muted style={styles.credit}>
        {place.source === 'osm'
          ? 'DATOS DE LUGARES: OPENSTREETMAP'
          : 'LUGAR DE EJEMPLO · SIN CONEXIÓN AL BUSCADOR'}
      </Muted>
    </Screen>
  );
}

function Stat({ icon, value, label, color }) {
  return (
    <Panel tone="dark" style={styles.stat} shadow={false}>
      <PixelIcon name={icon} size={16} color={color} />
      <Text style={[type.label, { color: colors.text, fontSize: 12 }]}>{value}</Text>
      <Caption color={colors.textFaint}>{label}</Caption>
    </Panel>
  );
}

function Action({ icon, text, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.action, pressed && { opacity: 0.6 }]}>
      <PixelIcon name={icon} size={18} color={colors.cyan} />
      <Text style={[type.small, styles.actionText]} numberOfLines={1}>
        {text}
      </Text>
      <PixelIcon name="chevron" size={12} color={colors.borderLit} />
    </Pressable>
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
  hero: { height: 164, alignItems: 'center', justifyContent: 'center' },
  titleBlock: { marginTop: spacing(5), gap: spacing(2) },
  name: { fontSize: 15, color: colors.text, lineHeight: 24 },
  statsRow: { flexDirection: 'row', gap: spacing(3), marginTop: spacing(4) },
  stat: { flex: 1, alignItems: 'center', gap: spacing(1.5), padding: spacing(3) },
  description: { marginTop: spacing(5) },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(2), marginTop: spacing(4) },
  cta: { marginTop: spacing(5) },
  mapCard: { marginTop: spacing(5), padding: spacing(3), gap: spacing(3) },
  mapWrap: { height: 150, borderWidth: 3, borderColor: colors.border, overflow: 'hidden' },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(2) },
  address: { flex: 1, fontSize: 11 },
  actionsCard: { marginTop: spacing(5), padding: 0 },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    padding: spacing(4),
  },
  actionText: { color: colors.textDim, flex: 1 },
  credit: { textAlign: 'center', marginTop: spacing(6), fontSize: 9, letterSpacing: 0.8 },
  notFound: { textAlign: 'center', marginTop: spacing(10) },
});
