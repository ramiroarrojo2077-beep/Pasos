const R = 6371000;

export function distanceMeters(a, b) {
  if (!a || !b) return null;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function regionFrom(coords, deltaMeters = 900) {
  const latDelta = deltaMeters / 111000;
  const lonDelta =
    deltaMeters / (111000 * Math.max(0.2, Math.cos((coords.latitude * Math.PI) / 180)));
  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
    latitudeDelta: latDelta,
    longitudeDelta: lonDelta,
  };
}

export function mapsUrl(place) {
  const q = encodeURIComponent(`${place.name} ${place.address || ''}`.trim());
  return `https://www.google.com/maps/search/?api=1&query=${q}&query_place_id=`;
}

export function directionsUrl(place) {
  return `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;
}

export function randomId(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function inviteCode() {
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i += 1) out += abc[Math.floor(Math.random() * abc.length)];
  return out;
}
