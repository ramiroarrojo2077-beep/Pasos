import React, { useEffect, useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import PixelIcon from './PixelIcon';
import { Scanlines } from './ui';
import { CATEGORY_SPRITE } from './sprites';
import { colors, categoryColors } from '../theme';
import { regionFrom } from '../utils/geo';
import { darkMapStyle } from './mapStyle';

export default function PlacesMap({ center, places = [], selectedId, onSelect, style }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!center || !ref.current) return;
    ref.current.animateToRegion(regionFrom(center, 900), 600);
  }, [center]);

  useEffect(() => {
    if (!selectedId || !ref.current) return;
    const place = places.find((p) => p.id === selectedId);
    if (place) ref.current.animateToRegion(regionFrom(place, 400), 500);
  }, [selectedId, places]);

  if (!center) return <View style={[styles.map, style, styles.placeholder]} />;

  return (
    <View style={[styles.map, style]}>
      <MapView
        ref={ref}
        style={StyleSheet.absoluteFill}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={regionFrom(center, 900)}
        customMapStyle={darkMapStyle}
        userInterfaceStyle="dark"
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        showsBuildings={false}
        showsPointsOfInterest={false}
        toolbarEnabled={false}
      >
        {places.map((place) => {
          const tint = categoryColors[place.category] || colors.cyan;
          const active = place.id === selectedId;
          return (
            <Marker
              key={place.id}
              coordinate={{ latitude: place.latitude, longitude: place.longitude }}
              onPress={() => onSelect?.(place)}
              tracksViewChanges={false}
              anchor={{ x: 0.5, y: 1 }}
              title={place.name}
              description={place.subtitle}
            >
              <View style={styles.pinWrap}>
                <View style={styles.pinShadow} />
                <View
                  style={[
                    styles.pin,
                    { backgroundColor: tint, borderColor: active ? colors.lime : colors.bgDeep },
                  ]}
                >
                  <PixelIcon
                    name={CATEGORY_SPRITE[place.category] || 'pin'}
                    size={16}
                    color={colors.bgDeep}
                  />
                </View>
                <View style={[styles.pinStem, { backgroundColor: active ? colors.lime : tint }]} />
              </View>
            </Marker>
          );
        })}
      </MapView>
      <Scanlines opacity={0.14} period={4} />
    </View>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1, overflow: 'hidden' },
  placeholder: { backgroundColor: colors.panelAlt },
  pinWrap: { width: 32, alignItems: 'center' },
  pinShadow: {
    position: 'absolute',
    left: 3,
    top: 3,
    width: 32,
    height: 32,
    backgroundColor: colors.shadow,
  },
  pin: {
    width: 32,
    height: 32,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinStem: { width: 4, height: 7 },
});
