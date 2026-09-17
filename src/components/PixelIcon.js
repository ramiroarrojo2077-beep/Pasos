import React, { useMemo } from 'react';
import Svg, { Rect } from 'react-native-svg';
import { colors } from '../theme';
import { SPRITES } from './sprites';

const OPACITY = { '#': 1, '+': 0.62, o: 0.34 };

/** Agrupa píxeles contiguos de la misma fila en un solo rect. */
function compile(grid) {
  const runs = [];
  grid.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      if (ch === '.') {
        x += 1;
        continue;
      }
      let len = 1;
      while (x + len < row.length && row[x + len] === ch) len += 1;
      runs.push({ x, y, len, ch });
      x += len;
    }
  });
  return runs;
}

const CACHE = {};
function runsFor(name) {
  if (!CACHE[name]) CACHE[name] = compile(SPRITES[name] || SPRITES.pin);
  return CACHE[name];
}

/**
 * Icono pixel-art dibujado sobre una grilla de 12x12.
 * `flip` espeja en horizontal (sirve para la flecha de "volver").
 */
export default function PixelIcon({
  name,
  size = 20,
  color = colors.text,
  flip = false,
  style,
}) {
  const runs = useMemo(() => runsFor(name), [name]);
  const unit = size / 12;
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      style={[flip ? { transform: [{ scaleX: -1 }] } : null, style]}
      shapeRendering="crispEdges"
    >
      {runs.map((r, i) => (
        <Rect
          key={i}
          x={r.x}
          y={r.y}
          width={r.len + 0.02}
          height={1.02}
          fill={color}
          fillOpacity={OPACITY[r.ch] ?? 1}
        />
      ))}
    </Svg>
  );
}

