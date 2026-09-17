import { DEMO_PLACES } from '../data/demo';
import { distanceMeters } from '../utils/geo';

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

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

function buildQuery({ latitude, longitude }, radius) {
  return `[out:json][timeout:20];
(
  node["amenity"~"^(cafe|restaurant|fast_food|ice_cream|bakery|juice_bar)$"](around:${radius},${latitude},${longitude});
  way["amenity"~"^(cafe|restaurant|fast_food|ice_cream|bakery|juice_bar)$"](around:${radius},${latitude},${longitude});
);
out center ${80};`;
}

function normalize(element, center) {
  const lat = element.lat ?? element.center?.lat;
  const lon = element.lon ?? element.center?.lon;
  if (lat == null || lon == null) return null;
  const tags = element.tags || {};
  if (!tags.name) return null;
  const category = AMENITY_TO_CATEGORY[tags.amenity] || 'otros';
  const cuisine = (tags.cuisine || '').split(';')[0].replace(/_/g, ' ');
  const subtitle = [CATEGORY_LABEL[category], cuisine ? cuisine : null]
    .filter(Boolean)
    .join(' · ');
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
    distance: distanceMeters(center, coords),
    source: 'osm',
  };
}

export function demoPlacesAround(center) {
  return DEMO_PLACES.map((p) => {
    const coords = {
      latitude: center.latitude + p.offset.lat,
      longitude: center.longitude + p.offset.lon,
    };
    return {
      ...p,
      ...coords,
      address: 'A pocas cuadras',
      distance: distanceMeters(center, coords),
      source: 'demo',
    };
  }).sort((a, b) => a.distance - b.distance);
}

async function fetchFrom(endpoint, query, signal) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: query,
    signal,
  });
  if (!res.ok) throw new Error(`Overpass ${res.status}`);
  return res.json();
}

/**
 * Busca cafeterías y lugares de comida reales cerca de unas coordenadas.
 * Usa OpenStreetMap (Overpass), sin API key. Si falla la red, devuelve lugares demo.
 */
export async function fetchNearbyPlaces(center, radius = 1500) {
  const query = buildQuery(center, radius);
  for (const endpoint of OVERPASS_ENDPOINTS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const json = await fetchFrom(endpoint, query, controller.signal);
      clearTimeout(timer);
      const places = (json.elements || [])
        .map((el) => normalize(el, center))
        .filter(Boolean)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 60);
      if (places.length) return { places, source: 'osm' };
    } catch (err) {
      clearTimeout(timer);
    }
  }
  return { places: demoPlacesAround(center), source: 'demo' };
}
