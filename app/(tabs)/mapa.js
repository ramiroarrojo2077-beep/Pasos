import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import PixelIcon from '../../src/components/PixelIcon';
import { Caption, Chip, IconButton, Muted, Panel, Screen } from '../../src/components/ui';
import MapaSeguro from '../../src/components/MapaSeguro';
import PlaceRow from '../../src/components/PlaceRow';
import { usePlaces } from '../../src/state/places';
import { useStore } from '../../src/state/store';
import { CATEGORIES } from '../../src/data/demo';
import { colors, spacing, type } from '../../src/theme';

export default function Mapa() {
  const router = useRouter();
  const { places, center, loading, source, motivo, locationDenied, locate, reload } = usePlaces();
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

  return (
    <Screen style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Caption color={colors.cyan}>Zona</Caption>
          <Text style={[type.title, styles.title]}>MAPA</Text>
        </View>
        <View style={styles.headerActions}>
          <View style={styles.counter}>
            <Text style={[type.tiny, { color: colors.textFaint }]}>
              {filtered.length} LUGARES
            </Text>
          </View>
          <IconButton
            icon="heart"
            size={20}
            color={onlyFavs ? colors.magenta : colors.textFaint}
            onPress={() => setOnlyFavs((v) => !v)}
          />
        </View>
      </View>

      <View style={styles.mapFrame}>
        <MapaSeguro
          center={center}
          places={filtered}
          selectedId={selected}
          onSelect={(p) => setSelected(p.id)}
        />
        <Pressable style={styles.locateBtn} onPress={locate}>
          <PixelIcon name="navigate" size={16} color={colors.lime} />
        </Pressable>
        {loading ? (
          <View style={styles.loadingPill}>
            <ActivityIndicator size="small" color={colors.lime} />
            <Text style={[type.tiny, { color: colors.textDim, letterSpacing: 0.8 }]}>
              BUSCANDO…
            </Text>
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
        <Panel tone="dark" style={styles.notice} onPress={locate}>
          <PixelIcon name="pin" size={16} color={colors.amber} />
          <Muted style={styles.noticeText}>
            Sin permiso de ubicación mostramos una zona por defecto. Tocá para reintentar.
          </Muted>
        </Panel>
      ) : null}
      {source === 'demo' && !loading ? (
        <Panel tone="dark" style={styles.notice} onPress={reload}>
          <PixelIcon name="globe" size={16} color={colors.amber} />
          <Muted style={styles.noticeText}>
            {motivo === 'sin-lugares'
              ? 'No hay cafés ni restaurantes cargados en OpenStreetMap cerca tuyo. Mientras tanto van estos de ejemplo. Tocá para reintentar.'
              : 'No se pudo conectar al buscador de lugares. Estos son de ejemplo, no existen. Tocá para reintentar.'}
          </Muted>
        </Panel>
      ) : null}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: spacing(3) }} />}
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingList}>
              <ActivityIndicator color={colors.lime} />
              <Muted style={styles.empty}>Escaneando la zona…</Muted>
            </View>
          ) : (
            <Muted style={styles.empty}>
              {onlyFavs
                ? 'Todavía no guardaste favoritos. Tocá el corazón en la ficha de un lugar.'
                : 'No hay lugares de esta categoría en el radio de búsqueda.'}
            </Muted>
          )
        }
        renderItem={({ item }) => (
          <PlaceRow
            place={item}
            active={item.id === selected}
            onPress={() => {
              setSelected(item.id);
              router.push(`/lugar/${encodeURIComponent(item.id)}`);
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
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingVertical: spacing(4),
  },
  title: { fontSize: 16, color: colors.text, marginTop: 4 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing(3) },
  counter: {
    borderWidth: 2,
    borderColor: colors.borderDim,
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
  },
  mapFrame: {
    height: 248,
    borderWidth: 3,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  locateBtn: {
    position: 'absolute',
    right: spacing(3),
    bottom: spacing(3),
    width: 38,
    height: 38,
    backgroundColor: colors.panel,
    borderWidth: 3,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingPill: {
    position: 'absolute',
    top: spacing(3),
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
    backgroundColor: colors.bgDeep,
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1.5),
  },
  chipsWrap: { flexGrow: 0, marginTop: spacing(4) },
  chips: { gap: spacing(2), paddingRight: spacing(4) },
  notice: {
    marginTop: spacing(3),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    padding: spacing(3),
  },
  noticeText: { flex: 1, fontSize: 11, lineHeight: 16 },
  list: { paddingTop: spacing(4), paddingBottom: spacing(6) },
  empty: { textAlign: 'center', paddingVertical: spacing(4), paddingHorizontal: spacing(6) },
  loadingList: { alignItems: 'center', paddingVertical: spacing(8), gap: spacing(3) },
});
