import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Chip, Muted, Screen } from '../../src/components/ui';
import PlacesMap from '../../src/components/PlacesMap';
import PlaceRow from '../../src/components/PlaceRow';
import { usePlaces } from '../../src/state/places';
import { useStore } from '../../src/state/store';
import { CATEGORIES } from '../../src/data/demo';
import { colors, radius, spacing } from '../../src/theme';

export default function Mapa() {
  const router = useRouter();
  const { places, center, loading, source, locationDenied, locate, reload } = usePlaces();
  const { favorites } = useStore();
  const [category, setCategory] = useState('todos');
  const [selected, setSelected] = useState(null);
  const [onlyFavs, setOnlyFavs] = useState(false);

  const filtered = useMemo(() => {
    let list = places;
    if (category !== 'todos') list = list.filter((p) => p.category === category);
    if (onlyFavs) list = list.filter((p) => favorites.includes(p.id));
    return list;
  }, [places, category, onlyFavs, favorites]);

  const open = (place) => router.push(`/lugar/${encodeURIComponent(place.id)}`);

  return (
    <Screen style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Mapa</Text>
        <Pressable onPress={() => setOnlyFavs((v) => !v)} hitSlop={10}>
          <Text style={[styles.filterIcon, onlyFavs && { color: colors.pink }]}>
            {onlyFavs ? '❤️' : '🤍'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.mapWrap}>
        <PlacesMap
          center={center}
          places={filtered}
          selectedId={selected}
          onSelect={(p) => setSelected(p.id)}
        />
        <Pressable style={styles.locateBtn} onPress={locate}>
          <Text style={styles.locateIcon}>➤</Text>
        </Pressable>
        {loading ? (
          <View style={styles.loadingPill}>
            <ActivityIndicator size="small" color={colors.lime} />
            <Text style={styles.loadingText}>Buscando lugares…</Text>
          </View>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        style={styles.chipsWrap}
      >
        {CATEGORIES.map((c) => (
          <Chip
            key={c.id}
            label={c.label}
            icon={c.icon}
            active={category === c.id}
            onPress={() => setCategory(c.id)}
          />
        ))}
      </ScrollView>

      {locationDenied ? (
        <Pressable onPress={locate} style={styles.notice}>
          <Text style={styles.noticeText}>
            📍 Sin permiso de ubicación te mostramos el centro por defecto. Tocá para reintentar.
          </Text>
        </Pressable>
      ) : null}
      {source === 'demo' && !loading ? (
        <Pressable onPress={reload} style={styles.notice}>
          <Text style={styles.noticeText}>
            🛰️ Sin conexión al buscador de lugares: estos son ejemplos. Tocá para reintentar.
          </Text>
        </Pressable>
      ) : null}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: spacing(2.5) }} />}
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingList}>
              <ActivityIndicator color={colors.lime} />
              <Muted style={styles.empty}>Buscando cafeterías y comida cerca tuyo…</Muted>
            </View>
          ) : (
            <Muted style={styles.empty}>
              {onlyFavs
                ? 'Todavía no guardaste favoritos. Tocá el corazón en un lugar.'
                : 'No hay lugares de esta categoría cerca.'}
            </Muted>
          )
        }
        renderItem={({ item }) => (
          <PlaceRow
            place={item}
            active={item.id === selected}
            onPress={() => {
              setSelected(item.id);
              open(item);
            }}
          />
        )}
      />
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
  title: { color: colors.text, fontSize: 20, fontWeight: '800' },
  filterIcon: { fontSize: 20 },
  mapWrap: {
    height: 260,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.borderSoft,
  },
  locateBtn: {
    position: 'absolute',
    right: spacing(3),
    bottom: spacing(3),
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locateIcon: { color: colors.lime, fontSize: 16, fontWeight: '800' },
  loadingPill: {
    position: 'absolute',
    top: spacing(3),
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
    backgroundColor: 'rgba(7,12,24,0.85)',
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1.5),
    borderRadius: radius.pill,
  },
  loadingText: { color: colors.textSoft, fontSize: 12, fontWeight: '700' },
  chipsWrap: { flexGrow: 0, marginTop: spacing(3) },
  chips: { gap: spacing(2), paddingRight: spacing(4) },
  notice: {
    marginTop: spacing(3),
    backgroundColor: colors.cardAlt,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.borderSoft,
    padding: spacing(3),
  },
  noticeText: { color: colors.textSoft, fontSize: 12 },
  list: { paddingTop: spacing(4), paddingBottom: spacing(6) },
  empty: { textAlign: 'center', paddingVertical: spacing(4) },
  loadingList: { alignItems: 'center', paddingVertical: spacing(8), gap: spacing(2) },
});
