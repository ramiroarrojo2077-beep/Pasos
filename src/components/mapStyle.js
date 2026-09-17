// Estilo oscuro tipo "pixel night" para Google Maps (Android / iOS con provider Google).
export const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#0E1830' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#070C18' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#7E93B8' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#6F86AC' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#14311F' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#4C8B5C' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#16294A' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8FA6C8' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#1E3A66' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#17223C' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0A1730' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3E5C88' }] },
];
