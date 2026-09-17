export const colors = {
  bg: '#0A1020',
  bgDeep: '#070C18',
  card: '#101B33',
  cardAlt: '#0E1830',
  border: '#1E3357',
  borderSoft: '#162642',
  lime: '#C8F751',
  limeDark: '#8FBA2A',
  pink: '#F2439B',
  orange: '#F2913D',
  blue: '#4DA6FF',
  purple: '#9B6DFF',
  text: '#E9F1FF',
  textSoft: '#A9BCDC',
  muted: '#6F86AC',
  danger: '#FF5E6C',
  gold: '#FFD34E',
  silver: '#C9D6E8',
  bronze: '#D08A4F',
};

export const categoryColors = {
  cafe: colors.orange,
  comida: colors.pink,
  jugos: colors.lime,
  helados: colors.purple,
  otros: colors.blue,
};

export const spacing = (n) => n * 4;

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
};

export const fonts = {
  pixel: 'PressStart2P_400Regular',
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
};
