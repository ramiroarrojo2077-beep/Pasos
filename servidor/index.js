/**
 * Servidor de grupos de Pasos.
 *
 * Guarda, por cada código de torneo, la lista de jugadores con su historial
 * de pasos. Es lo mínimo para que los amigos se vean entre sí: sin cuentas,
 * sin contraseñas, sin datos personales más que el nombre que cada uno eligió.
 *
 * Sin dependencias: se ejecuta con `node servidor/index.js`.
 */

import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const PUERTO = process.env.PORT || 8787;
const ARCHIVO = process.env.DATOS || join(process.cwd(), 'datos', 'grupos.json');
const MAX_JUGADORES = 50;
const MAX_DIAS = 60;

let grupos = {};

async function cargar() {
  try {
    grupos = JSON.parse(await readFile(ARCHIVO, 'utf8'));
    console.log(`Cargados ${Object.keys(grupos).length} grupos`);
  } catch {
    grupos = {};
  }
}

let guardadoPendiente = null;
function guardar() {
  clearTimeout(guardadoPendiente);
  guardadoPendiente = setTimeout(async () => {
    try {
      await mkdir(dirname(ARCHIVO), { recursive: true });
      await writeFile(ARCHIVO, JSON.stringify(grupos));
    } catch (err) {
      console.error('No se pudo guardar:', err.message);
    }
  }, 1000);
}

/** Nos quedamos solo con lo que necesitamos, y acotado. */
function limpiarJugador(cuerpo, id) {
  const historial = {};
  const dias = Object.entries(cuerpo?.historial || {})
    .filter(([dia, pasos]) => /^\d{4}-\d{2}-\d{2}$/.test(dia) && Number.isFinite(Number(pasos)))
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .slice(0, MAX_DIAS);
  for (const [dia, pasos] of dias) {
    historial[dia] = Math.max(0, Math.min(200000, Math.round(Number(pasos))));
  }
  return {
    id,
    nombre: String(cuerpo?.nombre || 'Jugador').slice(0, 14),
    avatar: {
      sprite: String(cuerpo?.avatar?.sprite || 'ghost').slice(0, 12),
      color: /^#[0-9A-Fa-f]{6}$/.test(cuerpo?.avatar?.color || '')
        ? cuerpo.avatar.color
        : '#B8FF3C',
    },
    historial,
    visto: Date.now(),
  };
}

function responder(res, estado, cuerpo) {
  const texto = JSON.stringify(cuerpo);
  res.writeHead(estado, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,PUT,OPTIONS',
    'access-control-allow-headers': 'content-type',
    'cache-control': 'no-store',
  });
  res.end(texto);
}

async function leerCuerpo(req) {
  const trozos = [];
  let total = 0;
  for await (const t of req) {
    total += t.length;
    if (total > 256 * 1024) throw new Error('cuerpo demasiado grande');
    trozos.push(t);
  }
  return trozos.length ? JSON.parse(Buffer.concat(trozos).toString('utf8')) : {};
}

const servidor = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return responder(res, 204, {});

  const url = new URL(req.url, 'http://local');
  const partes = url.pathname.split('/').filter(Boolean);

  if (partes[0] === 'salud') return responder(res, 200, { ok: true });

  // /g/:codigo            → ver el grupo
  // /g/:codigo/:jugador   → anotarse y actualizar los pasos propios
  if (partes[0] !== 'g' || !partes[1]) {
    return responder(res, 404, { error: 'Ruta desconocida' });
  }

  const codigo = partes[1].toUpperCase().slice(0, 12);
  if (!/^[A-Z0-9]{4,12}$/.test(codigo)) {
    return responder(res, 400, { error: 'Código inválido' });
  }

  const grupo = (grupos[codigo] ||= { jugadores: {} });

  try {
    if (req.method === 'GET') {
      return responder(res, 200, { codigo, jugadores: Object.values(grupo.jugadores) });
    }

    if (req.method === 'PUT' && partes[2]) {
      const id = partes[2].slice(0, 40);
      const cuerpo = await leerCuerpo(req);
      const yaEsta = Boolean(grupo.jugadores[id]);
      if (!yaEsta && Object.keys(grupo.jugadores).length >= MAX_JUGADORES) {
        return responder(res, 409, { error: 'El grupo está lleno' });
      }
      grupo.jugadores[id] = limpiarJugador(cuerpo, id);
      guardar();
      return responder(res, 200, { codigo, jugadores: Object.values(grupo.jugadores) });
    }
  } catch (err) {
    return responder(res, 400, { error: err.message });
  }

  return responder(res, 405, { error: 'Método no permitido' });
});

await cargar();
servidor.listen(PUERTO, () => console.log(`Pasos escuchando en :${PUERTO}`));
