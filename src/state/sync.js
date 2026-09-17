import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useStore } from './store';
import { sincronizarGrupo } from '../services/sync';

const SyncContext = createContext(null);
const CADA = 60000;

/**
 * Mantiene los torneos sincronizados con el servidor del grupo: sube los
 * pasos propios y baja los de todos los que entraron con el mismo código.
 * Si no hay servidor configurado no hace nada y la app sigue andando local.
 */
export function SyncProvider({ children }) {
  const { ready, settings, profile, history, tournaments, setRemotos } = useStore();
  const [estado, setEstado] = useState('inactivo'); // inactivo · sincronizando · ok · error
  const [error, setError] = useState(null);
  const [ultima, setUltima] = useState(null);
  const enCurso = useRef(false);

  const servidor = settings?.servidor || '';

  const sincronizar = useCallback(async () => {
    if (!servidor || !ready || enCurso.current) return;
    const conCodigo = tournaments.filter((t) => t.code);
    if (!conCodigo.length) return;

    enCurso.current = true;
    setEstado('sincronizando');
    setError(null);

    const jugador = {
      id: profile.code,
      nombre: profile.name || 'Jugador',
      avatar: profile.avatar,
      historial: history,
    };

    let falló = null;
    for (const torneo of conCodigo) {
      try {
        const jugadores = await sincronizarGrupo({ servidor, codigo: torneo.code, jugador });
        if (jugadores) setRemotos(torneo.code, jugadores);
      } catch (err) {
        falló = err?.message || 'No se pudo sincronizar';
      }
    }

    enCurso.current = false;
    if (falló) {
      setEstado('error');
      setError(falló);
    } else {
      setEstado('ok');
      setUltima(new Date());
    }
  }, [servidor, ready, tournaments, profile, history, setRemotos]);

  useEffect(() => {
    if (!servidor) {
      setEstado('inactivo');
      return undefined;
    }
    sincronizar();
    const reloj = setInterval(sincronizar, CADA);
    const app = AppState.addEventListener('change', (e) => {
      if (e === 'active') sincronizar();
    });
    return () => {
      clearInterval(reloj);
      app.remove();
    };
  }, [servidor, sincronizar]);

  return (
    <SyncContext.Provider value={{ estado, error, ultima, sincronizar, activo: Boolean(servidor) }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error('useSync debe usarse dentro de <SyncProvider>');
  return ctx;
}
