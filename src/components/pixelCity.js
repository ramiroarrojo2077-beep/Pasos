/**
 * Generador de una ciudad pixel vista desde arriba.
 * Es determinista: las mismas coordenadas dibujan siempre la misma ciudad,
 * así el mapa no cambia entre re-renders.
 */

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seedFrom(center) {
  if (!center) return 1234;
  return Math.abs(
    Math.round(center.latitude * 1e4) * 31 + Math.round(center.longitude * 1e4) * 17,
  );
}

/**
 * Devuelve las capas del mapa en unidades de celda (no en píxeles):
 * calles, río, manzanas verdes con árboles y edificios con ventanas.
 */
export function buildCity({ cols, rows, seed, block = 8 }) {
  const rand = mulberry32(seed);

  const roadsX = [];
  const roadsY = [];
  for (let x = 3 + Math.floor(rand() * 3); x < cols - 2; x += block + Math.floor(rand() * 3)) {
    roadsX.push(x);
  }
  for (let y = 3 + Math.floor(rand() * 3); y < rows - 2; y += block + Math.floor(rand() * 3)) {
    roadsY.push(y);
  }

  const hasRiver = rand() < 0.5;
  const riverStart = 2 + Math.floor(rand() * (cols - 6));
  const riverSlope = rand() < 0.5 ? 0.5 : -0.5;
  const riverWidth = 3 + Math.floor(rand() * 2);
  const riverAt = (y) => riverStart + y * riverSlope;
  const overWater = (x, y) => {
    if (!hasRiver) return false;
    const rx = riverAt(y);
    return x + 1 >= rx && x - 1 <= rx + riverWidth;
  };

  const xEdges = [0, ...roadsX.map((r) => r + 2), cols];
  const yEdges = [0, ...roadsY.map((r) => r + 2), rows];

  const parks = [];
  const lots = [];

  for (let i = 0; i < xEdges.length - 1; i += 1) {
    for (let j = 0; j < yEdges.length - 1; j += 1) {
      const x0 = xEdges[i];
      const y0 = yEdges[j];
      const x1 = Math.min(xEdges[i + 1] - 2, cols);
      const y1 = Math.min(yEdges[j + 1] - 2, rows);
      const w = x1 - x0;
      const h = y1 - y0;
      if (w < 2 || h < 2) continue;
      if (overWater(x0 + w / 2, y0 + h / 2)) continue;

      if (rand() < 0.2) {
        const trees = [];
        const count = Math.max(2, Math.floor((w * h) / 9));
        for (let t = 0; t < count; t += 1) {
          trees.push({
            x: x0 + Math.floor(rand() * w),
            y: y0 + Math.floor(rand() * h),
          });
        }
        parks.push({ x: x0, y: y0, w, h, trees });
        continue;
      }

      // Dos o tres edificios por manzana, con alturas y ventanas propias.
      const pieces = 1 + Math.floor(rand() * 3);
      let cx = x0;
      for (let p = 0; p < pieces; p += 1) {
        const pw = Math.max(2, Math.floor(w / pieces) - (p === pieces - 1 ? 0 : 1));
        if (cx + pw > x1) break;
        const ph = Math.max(2, h - Math.floor(rand() * 2));
        const ly = y0 + (h - ph);
        const windows = [];
        for (let wy = ly + 1; wy < ly + ph - 1; wy += 2) {
          for (let wx = cx + 1; wx < cx + pw - 1; wx += 2) {
            if (rand() < 0.25) continue;
            windows.push({ x: wx, y: wy, lit: rand() < 0.22 });
          }
        }
        lots.push({ x: cx, y: ly, w: pw, h: ph, tone: Math.floor(rand() * 3), windows });
        cx += pw + 1;
      }
    }
  }

  return { roadsX, roadsY, parks, lots, hasRiver, riverAt, riverWidth };
}
