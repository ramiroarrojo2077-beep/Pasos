/**
 * Tema "retro arcade": paleta de fósforo sobre CRT oscuro, bordes duros,
 * esquinas en escalón y sombras sin difuminar.
 */

export const colors = {
  // Fondo del gabinete
  bg: '#0A0E1C',
  bgDeep: '#05070F',
  bgGrid: '#111A33',

  // Paneles
  panel: '#111A30',
  panelAlt: '#0C1426',
  panelLit: '#17233F',

  // Bordes
  border: '#2B4272',
  borderLit: '#3E5D99',
  borderDim: '#1B2A4A',

  // Fósforo / neón
  lime: '#B8FF3C',
  limeDim: '#6E9E1F',
  cyan: '#3CE7FF',
  cyanDim: '#1D7C8C',
  magenta: '#FF3CA5',
  magentaDim: '#9E2265',
  amber: '#FFB43C',
  amberDim: '#9E6A1F',
  violet: '#A87CFF',
  red: '#FF4D5E',

  // Texto
  text: '#EAF2FF',
  textDim: '#9DB2DC',
  textFaint: '#5D7099',

  // Podio
  gold: '#FFD23C',
  silver: '#C9D9F0',
  bronze: '#D98A4D',

  // Sombra dura
  shadow: '#03050C',
};

export const categoryColors = {
  cafe: colors.amber,
  comida: colors.magenta,
  jugos: colors.lime,
  helados: colors.violet,
  otros: colors.cyan,
};

export const spacing = (n) => n * 4;

/** En arcade no hay curvas: todo es cuadrado y las esquinas se recortan. */
export const radius = { none: 0, chip: 0 };

export const fonts = {
  display: 'PressStart2P_400Regular',
  body: 'Silkscreen_400Regular',
  bodyBold: 'Silkscreen_700Bold',
};

export const type = {
  hero: { fontFamily: fonts.display, fontSize: 24, lineHeight: 34 },
  title: { fontFamily: fonts.display, fontSize: 14, lineHeight: 22 },
  subtitle: { fontFamily: fonts.display, fontSize: 10, lineHeight: 17 },
  score: { fontFamily: fonts.display, fontSize: 22, lineHeight: 28 },
  scoreSm: { fontFamily: fonts.display, fontSize: 12, lineHeight: 16 },
  label: { fontFamily: fonts.bodyBold, fontSize: 14, lineHeight: 19, letterSpacing: 0.2 },
  body: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, letterSpacing: 0 },
  small: { fontFamily: fonts.body, fontSize: 12, lineHeight: 18, letterSpacing: 0 },
  tiny: { fontFamily: fonts.body, fontSize: 10, lineHeight: 15, letterSpacing: 0.4 },
};

/** Sombra dura desplazada, como los sprites de un gabinete. */
export const hardShadow = (offset = 4) => ({
  shadowColor: colors.shadow,
  shadowOpacity: 1,
  shadowRadius: 0,
  shadowOffset: { width: offset, height: offset },
  elevation: 0,
});

/** Resplandor de fósforo para textos y marcos activos. */
export const glow = (color, strength = 8) => ({
  textShadowColor: color,
  textShadowRadius: strength,
  textShadowOffset: { width: 0, height: 0 },
});
