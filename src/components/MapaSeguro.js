import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import PlacesMap from './PlacesMap';
import PixelIcon from './PixelIcon';
import { Boundary } from './CrashCatcher';
import { colors, spacing, type } from '../theme';

function SinMapa() {
  return (
    <View style={styles.caja}>
      <PixelIcon name="map" size={34} color={colors.borderLit} />
      <Text style={styles.texto}>MAPA NO DISPONIBLE{'\n'}EN ESTE DISPOSITIVO</Text>
    </View>
  );
}

/** El mapa, pero si el módulo nativo falla no se lleva puesta la pantalla. */
export default function MapaSeguro(props) {
  return (
    <Boundary fallback={<SinMapa />}>
      <PlacesMap {...props} />
    </Boundary>
  );
}

const styles = StyleSheet.create({
  caja: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing(3),
    backgroundColor: colors.panelAlt,
  },
  texto: {
    fontFamily: type.tiny.fontFamily,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.textFaint,
    textAlign: 'center',
    lineHeight: 16,
  },
});
