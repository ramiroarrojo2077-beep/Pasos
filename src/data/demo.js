import { colors } from '../theme';
import { dayKey, addDays } from '../utils/dates';

/** Personajes seleccionables: sprite + color de fósforo. */
export const AVATARS = [
  { id: 'p1', sprite: 'ghost', color: colors.lime },
  { id: 'p2', sprite: 'alien', color: colors.cyan },
  { id: 'p3', sprite: 'robot', color: colors.magenta },
  { id: 'p4', sprite: 'cat', color: colors.amber },
  { id: 'p5', sprite: 'skull', color: colors.violet },
  { id: 'p6', sprite: 'bird', color: colors.cyan },
  { id: 'p7', sprite: 'ghost', color: colors.magenta },
  { id: 'p8', sprite: 'alien', color: colors.lime },
  { id: 'p9', sprite: 'robot', color: colors.amber },
  { id: 'p10', sprite: 'cat', color: colors.violet },
  { id: 'p11', sprite: 'skull', color: colors.cyan },
  { id: 'p12', sprite: 'bird', color: colors.lime },
];

export const CATEGORIES = [
  { id: 'todos', label: 'Todos', icon: 'pin' },
  { id: 'cafe', label: 'Café', icon: 'coffee' },
  { id: 'comida', label: 'Comida', icon: 'food' },
  { id: 'jugos', label: 'Jugos', icon: 'juice' },
  { id: 'helados', label: 'Helados', icon: 'icecream' },
];

function seededSteps(seed, day) {
  const base = 4200 + ((seed * 977 + day * 613) % 9000);
  return Math.round(base / 10) * 10;
}

/** Rivales de ejemplo, para que la tabla tenga vida en el primer arranque. */
export function demoFriends() {
  const people = [
    { name: 'Tomi', avatar: AVATARS[1], daily: 12340 },
    { name: 'Vale', avatar: AVATARS[6], daily: 8432 },
    { name: 'Lau', avatar: AVATARS[5], daily: 7982 },
    { name: 'Dani', avatar: AVATARS[3], daily: 6421 },
    { name: 'Nico', avatar: AVATARS[4], daily: 5310 },
  ];
  return people.map((p, i) => {
    const history = {};
    for (let d = 0; d < 14; d += 1) {
      history[dayKey(addDays(new Date(), -d))] = d === 0 ? p.daily : seededSteps(i + 1, d);
    }
    return {
      id: `friend_${i + 1}`,
      name: p.name,
      avatar: p.avatar,
      code: `AMIGO${i + 1}`,
      demo: true,
      history,
    };
  });
}

export const DEMO_PLACES = [
  {
    id: 'demo_1',
    name: 'Cafetería La Esquina',
    category: 'cafe',
    subtitle: 'Café · Postres',
    description:
      'Café de especialidad y pastelería artesanal. Buen lugar para recuperar el aliento después de una caminata larga.',
    offset: { lat: 0.0018, lon: 0.0009 },
  },
  {
    id: 'demo_2',
    name: 'Taco Norte',
    category: 'comida',
    subtitle: 'Tacos · Mexicano',
    description: 'Tacos al pastor y quesadillas, con porciones generosas para reponer energía.',
    offset: { lat: -0.0031, lon: 0.0022 },
  },
  {
    id: 'demo_3',
    name: 'Brew & Go',
    category: 'cafe',
    subtitle: 'Café · Desayunos',
    description: 'Café para llevar y sándwiches simples. Buena parada para arrancar el recorrido.',
    offset: { lat: 0.0042, lon: -0.0028 },
  },
  {
    id: 'demo_4',
    name: 'Ramen City',
    category: 'comida',
    subtitle: 'Ramen · Asiático',
    description: 'Ramen casero y gyozas. Ideal para cerrar la jornada con el grupo completo.',
    offset: { lat: -0.0052, lon: -0.0016 },
  },
  {
    id: 'demo_5',
    name: 'Jugos Pixel',
    category: 'jugos',
    subtitle: 'Jugos · Licuados',
    description: 'Licuados y exprimidos naturales. La parada obligatoria a mitad de recorrido.',
    offset: { lat: 0.0026, lon: 0.0048 },
  },
  {
    id: 'demo_6',
    name: 'Heladería Nube',
    category: 'helados',
    subtitle: 'Helados · Postres',
    description: 'Helado artesanal con sabores rotativos. Buen premio para el que gana la fecha.',
    offset: { lat: -0.0014, lon: 0.0051 },
  },
];

export const DEFAULT_CENTER = { latitude: -34.6037, longitude: -58.3816 };
