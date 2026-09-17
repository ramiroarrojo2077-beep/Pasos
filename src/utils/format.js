export function formatNumber(n) {
  const value = Math.max(0, Math.round(Number(n) || 0));
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function formatDistance(meters) {
  if (meters == null || Number.isNaN(meters)) return '--';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1).replace('.', ',')} km`;
}

// ~1.3 m/s caminando tranquilo
export function walkMinutes(meters) {
  if (meters == null) return null;
  return Math.max(1, Math.round(meters / 78));
}

export function stepsToKm(steps) {
  return (steps * 0.75) / 1000;
}

export function stepsToKcal(steps) {
  return Math.round(steps * 0.04);
}

export function plural(n, one, many) {
  return n === 1 ? one : many;
}

/**
 * La Press Start 2P no tiene mayúsculas acentuadas: los gabinetes de los 80
 * eran ASCII puro. Sacamos las tildes sólo en los textos que usan esa fuente,
 * para que no aparezcan glifos de otra tipografía en el medio de una palabra.
 */
export function arcade(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
}
