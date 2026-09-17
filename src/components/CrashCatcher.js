import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, type } from '../theme';

/**
 * Pantalla de GAME OVER: si algo revienta, en vez de que la app se cierre
 * sola mostramos el error acá. Sirve para que se pueda leer y contar qué
 * pasó, sin necesidad de conectar el teléfono a una computadora.
 */
function GameOver({ error, onRetry }) {
  const mensaje = error?.message || String(error || 'Error desconocido');
  const pila = error?.stack ? String(error.stack).split('\n').slice(0, 14).join('\n') : '';

  return (
    <View style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <Text style={styles.titulo}>GAME</Text>
        <Text style={styles.titulo}>OVER</Text>
        <View style={styles.linea} />

        <Text style={styles.subtitulo}>LA APP SE TROPEZO CON ESTO:</Text>

        <View style={styles.caja}>
          <Text style={styles.mensaje} selectable>
            {mensaje}
          </Text>
        </View>

        {pila ? (
          <View style={[styles.caja, styles.cajaPila]}>
            <Text style={styles.pila} selectable>
              {pila}
            </Text>
          </View>
        ) : null}

        <Pressable onPress={onRetry} style={({ pressed }) => [styles.boton, pressed && styles.botonHundido]}>
          <Text style={styles.botonTexto}>CONTINUE ?</Text>
        </Pressable>

        <Text style={styles.ayuda}>
          Sacale una captura a esta pantalla y mandala: con eso se puede
          arreglar sin adivinar.
        </Text>
      </ScrollView>
    </View>
  );
}

export default class CrashCatcher extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidMount() {
    // Errores que no nacen del render (promesas, callbacks nativos) no los
    // ve componentDidCatch, así que también tomamos el handler global.
    const g = global?.ErrorUtils;
    if (g?.getGlobalHandler && g?.setGlobalHandler) {
      this.handlerPrevio = g.getGlobalHandler();
      g.setGlobalHandler((error, esFatal) => {
        if (esFatal) this.setState({ error });
        else this.handlerPrevio?.(error, esFatal);
      });
    }
  }

  componentWillUnmount() {
    if (this.handlerPrevio) global?.ErrorUtils?.setGlobalHandler?.(this.handlerPrevio);
  }

  render() {
    if (this.state.error) {
      return <GameOver error={this.state.error} onRetry={() => this.setState({ error: null })} />;
    }
    return this.props.children;
  }
}

export { GameOver };

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.bgDeep },
  contenido: { padding: 24, paddingTop: 72, gap: 12 },
  titulo: {
    fontFamily: type.hero.fontFamily,
    fontSize: 38,
    lineHeight: 46,
    color: colors.red,
    textAlign: 'center',
  },
  linea: { height: 3, backgroundColor: colors.red, marginVertical: 18 },
  subtitulo: {
    fontFamily: type.tiny.fontFamily,
    fontSize: 11,
    letterSpacing: 1.2,
    color: colors.amber,
    textAlign: 'center',
    marginBottom: 6,
  },
  caja: {
    backgroundColor: colors.panelAlt,
    borderWidth: 3,
    borderColor: colors.border,
    padding: 14,
  },
  cajaPila: { borderColor: colors.borderDim },
  mensaje: {
    fontFamily: type.body.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
  pila: {
    fontFamily: type.body.fontFamily,
    fontSize: 10,
    lineHeight: 15,
    color: colors.textFaint,
  },
  boton: {
    marginTop: 22,
    backgroundColor: colors.lime,
    borderWidth: 3,
    borderColor: colors.limeDim,
    paddingVertical: 18,
    alignItems: 'center',
  },
  botonHundido: { transform: [{ translateX: 3 }, { translateY: 3 }] },
  botonTexto: { fontFamily: type.title.fontFamily, fontSize: 13, color: colors.bgDeep },
  ayuda: {
    fontFamily: type.body.fontFamily,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textFaint,
    textAlign: 'center',
    marginTop: 18,
  },
});

/**
 * Límite chico: si lo que envuelve revienta, muestra un cartel en su lugar
 * en vez de tumbar toda la app. Lo usamos alrededor del mapa, que es el
 * componente nativo con más superficie para fallar.
 */
export class Boundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { falló: false };
  }

  static getDerivedStateFromError() {
    return { falló: true };
  }

  render() {
    if (this.state.falló) return this.props.fallback ?? null;
    return this.props.children;
  }
}
