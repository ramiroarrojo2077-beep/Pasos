import React, { useMemo } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import {
  Badge,
  Body,
  Button,
  Card,
  Divider,
  Muted,
  Screen,
} from '../../src/components/ui';
import PlacesMap from '../../src/components/PlacesMap';
import { usePlaces } from '../../src/state/places';
import { useStore } from '../../src/state/store';
import { colors, categoryColors, radius, spacing } from '../../src/theme';
import { directionsUrl } from '../../src/utils/geo';
import { formatDistance, walkMinutes } from '../../src/utils/format';

const ICONS = { cafe: '☕', comida: '🍽️', jugos: '🥤', helados: '🍦', otros: '📍' };

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
        <Header onBack={() => router.back()} />
        <Body style={styles.notFound}>No encontramos este lugar. Volvé al mapa y probá de nuevo.</Body>
      </Screen>
    );
  }

  const fav = favorites.includes(place.id);
  const tint = categoryColors[place.category] || colors.blue;
  const minutes = walkMinutes(place.distance);
  const stepsAprox = place.distance ? Math.round(place.distance / 0.75) : null;

  const openMaps = () => Linking.openURL(directionsUrl(place)).catch(() => {});

  const share = async () => {
    await Clipboard.setStringAsync(`${place.name} — ${directionsUrl(place)}`);
  };

  return (
    <Screen scroll style={styles.screen}>
      <Header
        onBack={() => router.back()}
        right={
          <Pressable onPress={() => toggleFavorite(place.id)} hitSlop={10}>
            <Text style={styles.heart}>{fav ? '❤️' : '🤍'}</Text>
          </Pressable>
        }
      />

      <View style={[styles.hero, { borderColor: tint, backgroundColor: `${tint}18` }]}>
        <Text style={styles.heroIcon}>{ICONS[place.category] || '📍'}</Text>
      </View>

      <Text style={styles.name}>{place.name}</Text>
      <Muted style={styles.subtitle}>{place.subtitle}</Muted>

      <View style={styles.metaRow}>
        <Meta icon="📍" text={formatDistance(place.distance)} />
        <Meta icon="🚶" text={minutes ? `${minutes} min` : '--'} />
        {stepsAprox ? <Meta icon="👟" text={`~${stepsAprox} pasos`} /> : null}
      </View>

      {place.description ? <Body style={styles.description}>{place.description}</Body> : null}

      <View style={styles.tags}>
        {place.openingHours ? <Badge label={`🕒 ${place.openingHours}`} color={colors.blue} /> : null}
        {place.outdoor ? <Badge label="🌤️ Mesas afuera" color={colors.lime} /> : null}
        {place.wifi ? <Badge label="📶 Wi-Fi" color={colors.purple} /> : null}
        {place.takeaway ? <Badge label="🥡 Para llevar" color={colors.orange} /> : null}
        {place.vegan ? <Badge label="🌱 Opciones veganas" color={colors.lime} /> : null}
      </View>

      <Button label="Cómo llegar" icon="➤" onPress={openMaps} style={styles.cta} />

      <Card style={styles.mapCard}>
        <View style={styles.mapWrap}>
          <PlacesMap center={center} places={[place]} selectedId={place.id} />
        </View>
        {place.address ? <Muted style={styles.address}>📮 {place.address}</Muted> : null}
      </Card>

      <Card style={styles.actionsCard}>
        {place.phone ? (
          <>
            <Pressable onPress={() => Linking.openURL(`tel:${place.phone}`)} style={styles.action}>
              <Text style={styles.actionIcon}>📞</Text>
              <Text style={styles.actionText}>{place.phone}</Text>
            </Pressable>
            <Divider />
          </>
        ) : null}
        {place.website ? (
          <>
            <Pressable onPress={() => Linking.openURL(place.website)} style={styles.action}>
              <Text style={styles.actionIcon}>🌐</Text>
              <Text style={styles.actionText} numberOfLines={1}>
                {place.website}
              </Text>
            </Pressable>
            <Divider />
          </>
        ) : null}
        <Pressable onPress={share} style={styles.action}>
          <Text style={styles.actionIcon}>🔗</Text>
          <Text style={styles.actionText}>Copiar link para mandarle a un amigo</Text>
        </Pressable>
      </Card>

      {place.source === 'osm' ? (
        <Muted style={styles.credit}>Datos de lugares: OpenStreetMap</Muted>
      ) : (
        <Muted style={styles.credit}>Lugar de ejemplo (sin conexión al buscador)</Muted>
      )}
    </Screen>
  );
}

function Header({ onBack, right }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} hitSlop={10}>
        <Text style={styles.back}>←</Text>
      </Pressable>
      {right}
    </View>
  );
}

function Meta({ icon, text }) {
  return (
    <View style={styles.meta}>
      <Text style={styles.metaIcon}>{icon}</Text>
      <Text style={styles.metaText}>{text}</Text>
    </View>
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
  heart: { fontSize: 22 },
  hero: {
    height: 170,
    borderRadius: radius.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIcon: { fontSize: 70 },
  name: { color: colors.text, fontSize: 24, fontWeight: '900', marginTop: spacing(4) },
  subtitle: { marginTop: spacing(1) },
  metaRow: { flexDirection: 'row', gap: spacing(4), marginTop: spacing(3), flexWrap: 'wrap' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing(1.5) },
  metaIcon: { fontSize: 14 },
  metaText: { color: colors.textSoft, fontSize: 14, fontWeight: '700' },
  description: { marginTop: spacing(4) },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(2), marginTop: spacing(4) },
  cta: { marginTop: spacing(5) },
  mapCard: { marginTop: spacing(4), padding: spacing(3), gap: spacing(3) },
  mapWrap: { height: 160, borderRadius: radius.md, overflow: 'hidden' },
  address: { fontSize: 12 },
  actionsCard: { marginTop: spacing(4), padding: 0, overflow: 'hidden' },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    padding: spacing(4),
  },
  actionIcon: { fontSize: 18 },
  actionText: { color: colors.textSoft, fontSize: 14, flex: 1, fontWeight: '600' },
  credit: { textAlign: 'center', marginTop: spacing(5), fontSize: 11 },
  notFound: { textAlign: 'center', marginTop: spacing(10) },
});
