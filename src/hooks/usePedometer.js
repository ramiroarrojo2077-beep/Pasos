import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { useStore } from '../state/store';
import {
  getBackgroundSupport,
  readHistory,
  requestStepsPermission,
  watchLiveSteps,
} from '../services/steps';

/**
 * Sincroniza los pasos del teléfono con el store.
 *
 * No corre nada en segundo plano: lee el registro que el sistema ya guarda
 * (coprocesador de movimiento en iOS, Health Connect en Android) cada vez que
 * la app se abre o vuelve al frente. Batería usada: prácticamente cero.
 */
export function usePedometer() {
  const { ready, setStepsForDay, addSteps, setSettings } = useStore();
  const [support, setSupport] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [error, setError] = useState(null);
  const stopLive = useRef(null);

  const sync = useCallback(
    async (days = 7) => {
      setSyncing(true);
      try {
        const history = await readHistory(days);
        const entries = Object.entries(history);
        entries.forEach(([day, steps]) => setStepsForDay(day, steps, true));
        if (entries.length) setLastSync(new Date());
        return entries.length > 0;
      } catch (err) {
        setError(err?.message || 'No pudimos leer tus pasos');
        return false;
      } finally {
        setSyncing(false);
      }
    },
    [setStepsForDay],
  );

  const connect = useCallback(async () => {
    const ok = await requestStepsPermission();
    const next = await getBackgroundSupport();
    setSupport(next);
    if (ok) await sync(7);
    return ok;
  }, [sync]);

  useEffect(() => {
    // Esperamos a que cargue lo guardado para no pisar el historial.
    if (!ready) return undefined;
    let alive = true;

    (async () => {
      const info = await getBackgroundSupport();
      if (!alive) return;
      setSupport(info);

      if (info.mode === 'none') {
        setSettings({ manualMode: true });
        return;
      }

      const granted = await requestStepsPermission();
      if (!alive) return;
      if (!granted) {
        setError('Necesitamos permiso para leer tu conteo de pasos.');
        return;
      }

      const gotHistory = await sync(7);
      if (!alive) return;

      // Respaldo: si el sistema no nos da histórico (Android sin Health
      // Connect), escuchamos el sensor mientras la app está abierta.
      if (!gotHistory && info.mode === 'android-foreground') {
        stopLive.current = watchLiveSteps((delta) => addSteps(delta));
      }
    })();

    const appSub = AppState.addEventListener('change', (next) => {
      if (next === 'active') sync(7);
    });

    return () => {
      alive = false;
      stopLive.current?.();
      appSub.remove();
    };
  }, [ready, addSteps, setSettings, sync]);

  return {
    support,
    available: support ? support.mode !== 'none' : null,
    backgroundEnabled: support?.background ?? false,
    manualMode: support?.mode === 'none',
    isWeb: Platform.OS === 'web',
    syncing,
    lastSync,
    error,
    sync,
    connect,
  };
}
