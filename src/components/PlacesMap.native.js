import React, { useEffect, useRef } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { colors, categoryColors, radius } from '../theme';
import { regionFrom } from '../utils/geo';
import { darkMapStyle } from './mapStyle';

const ICONS = { cafe: '☕', comida: '🍽️', jugos: '🥤', helados: '🍦', otros: '📍' };

export default function PlacesMap({ center, places, selectedId, onSelect, style }) {
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
    <MapView
      ref={ref}
      style={[styles.map, style]}
      provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
      initialRegion={regionFrom(center, 900)}
      customMapStyle={darkMapStyle}
      userInterfaceStyle="dark"
      showsUserLocation
      showsMyLocationButton={false}
      showsCompass={false}
      toolbarEnabled={false}
    >
      {places.map((place) => {
        const tint = categoryColors[place.category] || colors.blue;
        const active = place.id === selectedId;
        return (
          <Marker
            key={place.id}
            coordinate={{ latitude: place.latitude, longitude: place.longitude }}
            onPress={() => onSelect?.(place)}
            tracksViewChanges={false}
            title={place.name}
            description={place.subtitle}
          >
            <View
              style={[
                styles.pin,
                { backgroundColor: tint, borderColor: active ? colors.lime : '#0A1020' },
                active && styles.pinActive,
              ]}
            >
              <Text style={styles.pinIcon}>{ICONS[place.category] || '📍'}</Text>
            </View>
            <View style={[styles.pinTail, { borderTopColor: tint }]} />
          </Marker>
        );
      })}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1, borderRadius: radius.md },
  placeholder: { backgroundColor: colors.cardAlt },
  pin: {
    width: 34,
    height: 34,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinActive: { transform: [{ scale: 1.15 }] },
  pinIcon: { fontSize: 16 },
  pinTail: {
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
});
