import { dayKey, addDays } from '../utils/dates';

export const AVATARS = ['🧑‍🚀', '🦊', '🐸', '🐧', '🐼', '🦄', '🐙', '🐝', '🦖', '🐨', '🦉', '🐳'];

export const CATEGORIES = [
  { id: 'todos', label: 'Todos', icon: '📍' },
  { id: 'cafe', label: 'Cafeterías', icon: '☕' },
  { id: 'comida', label: 'Comida', icon: '🍽️' },
  { id: 'jugos', label: 'Jugos', icon: '🥤' },
  { id: 'helados', label: 'Helados', icon: '🍦' },
];

function seededSteps(seed, day) {
  const base = 4200 + ((seed * 977 + day * 613) % 9000);
  return Math.round(base / 10) * 10;
}

// Amigos de ejemplo para que la app tenga vida desde el primer arranque.
export function demoFriends() {
  const people = [
    { name: 'Tomi', avatar: '🦊', daily: 12340 },
    { name: 'Vale', avatar: '🐸', daily: 8432 },
    { name: 'Lau', avatar: '🐧', daily: 7982 },
    { name: 'Dani', avatar: '🐼', daily: 6421 },
    { name: 'Nico', avatar: '🦄', daily: 5310 },
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
    rating: 4.7,
    reviews: 124,
    description:
      'Buen café, pastelería artesanal y un ambiente ideal para recargar energía después de caminar.',
    offset: { lat: 0.0018, lon: 0.0009 },
  },
  {
    id: 'demo_2',
    name: 'Taco Norte',
    category: 'comida',
    subtitle: 'Tacos · Mexicanos',
    rating: 4.5,
    reviews: 88,
    description: 'Tacos al pastor y quesadillas. Porciones generosas para después del torneo.',
    offset: { lat: -0.0031, lon: 0.0022 },
  },
  {
    id: 'demo_3',
    name: 'Brew & Go',
    category: 'cafe',
    subtitle: 'Café · Desayunos',
    rating: 4.4,
    reviews: 65,
    description: 'Café de especialidad para llevar, perfecto para arrancar la caminata.',
    offset: { lat: 0.0042, lon: -0.0028 },
  },
  {
    id: 'demo_4',
    name: 'Ramen City',
    category: 'comida',
    subtitle: 'Ramen · Asiático',
    rating: 4.6,
    reviews: 203,
    description: 'Ramen casero y gyozas. Ideal para cerrar una caminata larga con amigos.',
    offset: { lat: -0.0052, lon: -0.0016 },
  },
  {
    id: 'demo_5',
    name: 'Jugos Pixel',
    category: 'jugos',
    subtitle: 'Jugos · Smoothies',
    rating: 4.3,
    reviews: 41,
    description: 'Licuados y jugos naturales, la parada obligatoria a mitad de recorrido.',
    offset: { lat: 0.0026, lon: 0.0048 },
  },
  {
    id: 'demo_6',
    name: 'Heladería Nube',
    category: 'helados',
    subtitle: 'Helados · Postres',
    rating: 4.8,
    reviews: 312,
    description: 'Helado artesanal con sabores rotativos. Premio perfecto para el ganador.',
    offset: { lat: -0.0014, lon: 0.0051 },
  },
];

export const DEFAULT_CENTER = { latitude: -34.6037, longitude: -58.3816 }; // Buenos Aires
