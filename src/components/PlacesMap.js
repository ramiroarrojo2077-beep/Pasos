import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import PixelIcon from './PixelIcon';
import { Scanlines } from './ui';
import { buildCity, seedFrom } from './pixelCity';
import { CATEGORY_SPRITE } from './sprites';
import { colors, categoryColors, type } from '../theme';

const CELL = 6;
const SPAN = 0.012; // ~1,3 km de lado

const CITY = {
  asphalt: '#070C18',
  road: '#1C2E52',
  roadLine: '#3B5D99',
  park: '#133A22',
  parkDot: '#1E6B39',
  water: '#0B2545',
  waterLine: '#123A6B',
  building: ['#141F38', '#18263F', '#101A2F'],
  window: '#2E4A7A',
  windowLit: '#4A7CC4',
};

/**
 * Mapa pixel generado a partir de las coordenadas: calles, manzanas,
 * parques y río. Se dibuja igual en el teléfono y en el navegador, así que
 * la app no depende del SDK de Google Maps —que además exige una clave y
 * una cuenta de facturación— ni de ningún módulo nativo de mapas.
 * Para llegar a un lugar abrimos la app de mapas del teléfono.
 */
export default function PlacesMap({ center, places = [], selectedId, onSelect, style, showTag = true }) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const cols = Math.ceil(size.width / CELL);
  const rows = Math.ceil(size.height / CELL);

  const city = useMemo(() => {
    if (!cols || !rows) return null;
    return buildCity({ cols, rows, seed: seedFrom(center) });
  }, [cols, rows, center]);

  const pins = useMemo(() => {
    if (!center || !size.width) return [];
    return places
      .map((p) => {
        const x = 0.5 + (p.longitude - center.longitude) / SPAN;
        const y = 0.5 - (p.latitude - center.latitude) / SPAN;
        if (x < 0.04 || x > 0.96 || y < 0.05 || y > 0.95) return null;
        return { ...p, left: x * size.width, top: y * size.height };
      })
      .filter(Boolean);
  }, [center, places, size]);

  return (
    <View
      style={[styles.map, style]}
      onLayout={(e) => setSize(e.nativeEvent.layout)}
    >
      {city ? (
        <Svg width={size.width} height={size.height} shapeRendering="crispEdges">
          <Rect x={0} y={0} width={size.width} height={size.height} fill={CITY.asphalt} />

          {/* Río */}
          {city.hasRiver
            ? Array.from({ length: rows }).map((_, y) => (
                <Rect
                  key={`w${y}`}
                  x={city.riverAt(y) * CELL}
                  y={y * CELL}
                  width={city.riverWidth * CELL}
                  height={CELL}
                  fill={y % 5 === 0 ? CITY.waterLine : CITY.water}
                />
              ))
            : null}

          {/* Manzanas verdes */}
          {city.parks.map((b, i) => (
            <React.Fragment key={`p${i}`}>
              <Rect
                x={b.x * CELL}
                y={b.y * CELL}
                width={b.w * CELL}
                height={b.h * CELL}
                fill={CITY.park}
              />
              {b.trees.map((t, k) => (
                <Rect
                  key={k}
                  x={t.x * CELL}
                  y={t.y * CELL}
                  width={CELL}
                  height={CELL}
                  fill={CITY.parkDot}
                />
              ))}
            </React.Fragment>
          ))}

          {/* Edificios con ventanas encendidas */}
          {city.lots.map((l, i) => (
            <React.Fragment key={`b${i}`}>
              <Rect
                x={l.x * CELL}
                y={l.y * CELL}
                width={l.w * CELL}
                height={l.h * CELL}
                fill={CITY.building[l.tone]}
              />
              {l.windows.map((w, k) => (
                <Rect
                  key={k}
                  x={w.x * CELL + 1}
                  y={w.y * CELL + 1}
                  width={CELL - 2}
                  height={CELL - 2}
                  fill={w.lit ? CITY.windowLit : CITY.window}
                />
              ))}
            </React.Fragment>
          ))}

          {/* Calles */}
          {city.roadsX.map((x) => (
            <Rect key={`rx${x}`} x={x * CELL} y={0} width={CELL * 2} height={size.height} fill={CITY.road} />
          ))}
          {city.roadsY.map((y) => (
            <Rect key={`ry${y}`} x={0} y={y * CELL} width={size.width} height={CELL * 2} fill={CITY.road} />
          ))}
          {/* Línea divisoria punteada */}
          {city.roadsX.map((x) =>
            Array.from({ length: Math.floor(rows / 3) }).map((_, k) => (
              <Rect
                key={`lx${x}-${k}`}
                x={x * CELL + CELL - 1}
                y={k * CELL * 3}
                width={2}
                height={CELL + 2}
                fill={CITY.roadLine}
              />
            )),
          )}
          {city.roadsY.map((y) =>
            Array.from({ length: Math.floor(cols / 3) }).map((_, k) => (
              <Rect
                key={`ly${y}-${k}`}
                x={k * CELL * 3}
                y={y * CELL + CELL - 1}
                width={CELL + 2}
                height={2}
                fill={CITY.roadLine}
              />
            )),
          )}
        </Svg>
      ) : null}

      {/* Jugador */}
      {size.width > 0 ? (
        <>
          <View
            style={[styles.playerRing, { left: size.width / 2 - 15, top: size.height / 2 - 15 }]}
            pointerEvents="none"
          />
          <View style={[styles.player, { left: size.width / 2 - 9, top: size.height / 2 - 9 }]}>
            <View style={styles.playerCore} />
          </View>
        </>
      ) : null}

      {/* Chinches */}
      {pins.map((p) => {
        const tint = categoryColors[p.category] || colors.cyan;
        const active = p.id === selectedId;
        return (
          <Pressable
            key={p.id}
            onPress={() => onSelect?.(p)}
            style={[styles.pinWrap, { left: p.left - 14, top: p.top - 28 }]}
          >
            <View style={styles.pinShadow} />
            <View
              style={[
                styles.pin,
                { backgroundColor: tint, borderColor: active ? colors.lime : colors.bgDeep },
              ]}
            >
              <PixelIcon
                name={CATEGORY_SPRITE[p.category] || 'pin'}
                size={14}
                color={colors.bgDeep}
              />
            </View>
            <View style={[styles.pinStem, { backgroundColor: active ? colors.lime : tint }]} />
          </Pressable>
        );
      })}

      <Scanlines opacity={0.22} period={4} />
      {showTag ? (
        <View style={styles.tag}>
          <Text style={[type.tiny, { color: colors.textFaint, letterSpacing: 1 }]}>
            MAPA PIXEL · ZONA APROXIMADA
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1, backgroundColor: CITY.asphalt, overflow: 'hidden' },
  playerRing: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderWidth: 2,
    borderColor: colors.cyanDim,
  },
  player: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderWidth: 3,
    borderColor: colors.bgDeep,
    backgroundColor: colors.cyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerCore: { width: 6, height: 6, backgroundColor: colors.bgDeep },
  pinWrap: { position: 'absolute', width: 28, alignItems: 'center' },
  pinShadow: {
    position: 'absolute',
    left: 3,
    top: 3,
    width: 28,
    height: 28,
    backgroundColor: colors.shadow,
  },
  pin: {
    width: 28,
    height: 28,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinStem: { width: 4, height: 6 },
  tag: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    backgroundColor: colors.bgDeep,
    borderWidth: 2,
    borderColor: colors.borderDim,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
});
