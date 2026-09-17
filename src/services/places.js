import { DEMO_PLACES } from '../data/demo';
import { distanceMeters } from '../utils/geo';

/**
 * Búsqueda de lugares reales en OpenStreetMap, vía Overpass.
 *
 * Overpass es gratis y sin clave, pero es lento y a veces devuelve 429 o
 * 504 cuando está cargado. Por eso: varios espejos, consulta por GET (pasa
 * mejor por redes móviles que un POST con cuerpo de texto), y si la zona
 * está vacía se amplía el radio antes de darse por vencido.
 */

const ESPEJOS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

const RADIOS = [1200, 3000, 8000];
const ESPERA = 25000;

const AMENITY_TO_CATEGORY = {
  cafe: 'cafe',
  coffee_shop: 'cafe',
  bakery: 'cafe',
  restaurant: 'comida',
  fast_food: 'comida',
  food_court: 'comida',
  ice_cream: 'helados',
  juice_bar: 'jugos',
  bar: 'otros',
  pub: 'otros',
};

const CATEGORY_LABEL = {
  cafe: 'Café',
  comida: 'Comida',
  helados: 'Helados',
  jugos: 'Jugos',
  otros: 'Otros',
};

function consulta({ latitude, longitude }, radio) {
  const lat = latitude.toFixed(6);
  const lon = longitude.toFixed(6);
  const tipos = 'cafe|restaurant|fast_food|ice_cream|bakery|juice_bar';
  return `[out:json][timeout:25];(` +
    `node["amenity"~"^(${tipos})$"]["name"](around:${radio},${lat},${lon});` +
    `way["amenity"~"^(${tipos})$"]["name"](around:${radio},${lat},${lon});` +
    `);out center 120;`;
}

function normalizar(element, centro) {
  const lat = element.lat ?? element.center?.lat;
  const lon = element.lon ?? element.center?.lon;
  if (lat == null || lon == null) return null;
  const tags = element.tags || {};
  if (!tags.name) return null;

  const category = AMENITY_TO_CATEGORY[tags.amenity] || 'otros';
  const cocina = (tags.cuisine || '').split(';')[0].replace(/_/g, ' ');
  const subtitle = [CATEGORY_LABEL[category], cocina || null].filter(Boolean).join(' · ');
  const coords = { latitude: lat, longitude: lon };

  return {
    id: `osm_${element.type}_${element.id}`,
    name: tags.name,
    category,
    subtitle,
    latitude: lat,
    longitude: lon,
    address: [tags['addr:street'], tags['addr:housenumber']].filter(Boolean).join(' '),
    openingHours: tags.opening_hours || null,
    phone: tags.phone || tags['contact:phone'] || null,
    website: tags.website || tags['contact:website'] || null,
    outdoor: tags.outdoor_seating === 'yes',
    takeaway: tags.takeaway === 'yes',
    vegan: tags['diet:vegan'] === 'yes' || tags['diet:vegan'] === 'only',
    wifi: tags.internet_access === 'wlan' || tags.internet_access === 'yes',
    distance: distanceMeters(centro, coords),
    source: 'osm',
  };
}

export function demoPlacesAround(centro) {
  return DEMO_PLACES.map((p) => {
    const coords = {
      latitude: centro.latitude + p.offset.lat,
      longitude: centro.longitude + p.offset.lon,
    };
    return {
      ...p,
      ...coords,
      address: 'Lugar de ejemplo',
      distance: distanceMeters(centro, coords),
      source: 'demo',
    };
  }).sort((a, b) => a.distance - b.distance);
}

async function pedir(endpoint, query) {
  const controlador = new AbortController();
  const reloj = setTimeout(() => controlador.abort(), ESPERA);
  try {
    const res = await fetch(`${endpoint}?data=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controlador.signal,
    });
    if (!res.ok) throw new Error(`Overpass respondió ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(reloj);
  }
}

/**
 * Devuelve { places, source, motivo }.
 *  source 'osm'  → lugares reales
 *  source 'demo' → no se pudo, van los de ejemplo, y `motivo` dice por qué
 */
export async function fetchNearbyPlaces(centro) {
  let huboRed = false;

  for (const radio of RADIOS) {
    const query = consulta(centro, radio);

    for (const endpoint of ESPEJOS) {
      try {
        const json = await pedir(endpoint, query);
        huboRed = true;
        const lugares = (json.elements || [])
          .map((el) => normalizar(el, centro))
          .filter(Boolean)
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 60);

        if (lugares.length) return { places: lugares, source: 'osm', radio };
        // Respondió bien pero la zona está vacía: probamos un radio mayor.
        break;
      } catch (err) {
        // Este espejo no anduvo; seguimos con el siguiente.
      }
    }
  }

  return {
    places: demoPlacesAround(centro),
    source: 'demo',
    motivo: huboRed ? 'sin-lugares' : 'sin-conexion',
  };
}
