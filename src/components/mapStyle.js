/**
 * Estilo "CRT neón" para el mapa nativo: base casi negra, calles en azul
 * eléctrico, parques de fósforo verde y agua profunda. Sin ruido de POIs
 * para que sólo se vean nuestras chinches.
 */
export const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#0A1020' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#05070F' }, { weight: 3 }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#5D7099' }] },

  { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.neighborhood', stylers: [{ visibility: 'off' }] },

  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ visibility: 'on' }, { color: '#123A22' }] },

  { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ color: '#0E1730' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#0C1526' }] },

  { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#1B2B4C' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#0A1020' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#6E86B5' }] },
  { featureType: 'road.arterial', elementType: 'geometry.fill', stylers: [{ color: '#243A66' }] },
  { featureType: 'road.highway', elementType: 'geometry.fill', stylers: [{ color: '#2E4C85' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#05070F' }] },
  { featureType: 'road.local', elementType: 'labels', stylers: [{ visibility: 'off' }] },

  { featureType: 'transit', stylers: [{ visibility: 'off' }] },

  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#071B36' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#2C5486' }] },
];
