/**
 * Cliente del servidor de grupos. Si no hay servidor configurado, la app
 * funciona igual pero cada uno ve solo sus propios pasos.
 */

const ESPERA = 12000;

export function normalizarServidor(texto) {
  const limpio = String(texto || '').trim().replace(/\/+$/, '');
  if (!limpio) return '';
  if (!/^https?:\/\//i.test(limpio)) return `http://${limpio}`;
  return limpio;
}

async function pedir(url, opciones = {}) {
  const controlador = new AbortController();
  const reloj = setTimeout(() => controlador.abort(), ESPERA);
  try {
    const res = await fetch(url, {
      ...opciones,
      headers: { 'content-type': 'application/json', ...(opciones.headers || {}) },
      signal: controlador.signal,
    });
    const cuerpo = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(cuerpo.error || `El servidor respondió ${res.status}`);
    return cuerpo;
  } finally {
    clearTimeout(reloj);
  }
}

/** Comprueba que la dirección sea realmente un servidor de Pasos. */
export async function probarServidor(servidor) {
  const base = normalizarServidor(servidor);
  if (!base) throw new Error('Falta la dirección');
  const r = await pedir(`${base}/salud`);
  if (!r.ok) throw new Error('Respondió, pero no parece un servidor de Pasos');
  return true;
}

/**
 * Se anota en el grupo del torneo y de paso trae a todos los demás.
 * El código del torneo es la llave del grupo.
 */
export async function sincronizarGrupo({ servidor, codigo, jugador }) {
  const base = normalizarServidor(servidor);
  if (!base || !codigo) return null;
  const r = await pedir(`${base}/g/${encodeURIComponent(codigo)}/${encodeURIComponent(jugador.id)}`, {
    method: 'PUT',
    body: JSON.stringify({
      nombre: jugador.nombre,
      avatar: jugador.avatar,
      historial: jugador.historial,
    }),
  });
  return Array.isArray(r.jugadores) ? r.jugadores : [];
}

/** Mira un grupo sin anotarse. */
export async function verGrupo({ servidor, codigo }) {
  const base = normalizarServidor(servidor);
  if (!base || !codigo) return null;
  const r = await pedir(`${base}/g/${encodeURIComponent(codigo)}`);
  return Array.isArray(r.jugadores) ? r.jugadores : [];
}
