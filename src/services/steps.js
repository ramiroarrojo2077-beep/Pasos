import { Platform } from 'react-native';
import { Pedometer } from 'expo-sensors';
import { addDays, dayKey, startOfDay } from '../utils/dates';

/**
 * Lectura de pasos "en segundo plano" sin gastar batería.
 *
 * La clave es no ejecutar nada en segundo plano: los pasos ya los cuenta
 * el hardware del teléfono las 24 hs (coprocesador de movimiento en iPhone,
 * sensor TYPE_STEP_COUNTER en Android, que alimenta Health Connect).
 * Nosotros sólo consultamos ese registro cuando la app se abre o vuelve al
 * frente, y recuperamos también los días que la app estuvo cerrada.
 *
 * - iOS  -> CMPedometer (expo-sensors), histórico de hasta 7 días.
 * - Android -> Health Connect (datos que el sistema ya guardó).
 * - Sin ninguno de los dos -> sensor en vivo mientras la app está abierta.
 */

const STEPS_PERMISSION = { accessType: 'read', recordType: 'Steps' };

let healthConnect = null;
let hcInitPromise = null;

function loadHealthConnect() {
  if (Platform.OS !== 'android') return null;
  if (healthConnect) return healthConnect;
  try {
    // require diferido: en iOS/web el módulo no existe.
    healthConnect = require('react-native-health-connect');
  } catch (err) {
    healthConnect = null;
  }
  return healthConnect;
}

async function ensureHealthConnect() {
  const hc = loadHealthConnect();
  if (!hc) return null;
  if (!hcInitPromise) {
    hcInitPromise = (async () => {
      try {
        const status = await hc.getSdkStatus();
        // 3 = SDK_AVAILABLE
        if (status !== hc.SdkAvailabilityStatus.SDK_AVAILABLE) return false;
        return await hc.initialize();
      } catch (err) {
        return false;
      }
    })();
  }
  const ok = await hcInitPromise;
  return ok ? hc : null;
}

export async function getBackgroundSupport() {
  if (Platform.OS === 'ios') {
    try {
      const available = await Pedometer.isAvailableAsync();
      return {
        mode: available ? 'ios-motion' : 'none',
        background: available,
        label: available
          ? 'El iPhone cuenta tus pasos siempre, aunque la app esté cerrada.'
          : 'Este dispositivo no tiene sensor de pasos.',
      };
    } catch (err) {
      return { mode: 'none', background: false, label: 'Sensor de pasos no disponible.' };
    }
  }
  if (Platform.OS === 'android') {
    const hc = await ensureHealthConnect();
    if (hc) {
      const granted = await hasHealthConnectPermission();
      return {
        mode: 'health-connect',
        background: granted,
        label: granted
          ? 'Leemos los pasos que Health Connect ya registró, sin procesos en segundo plano.'
          : 'Conectá Health Connect para contar los pasos con la app cerrada.',
      };
    }
    let available = false;
    try {
      available = await Pedometer.isAvailableAsync();
    } catch (err) {
      available = false;
    }
    return {
      mode: available ? 'android-foreground' : 'none',
      background: false,
      label: available
        ? 'Sin Health Connect sólo contamos pasos con la app abierta.'
        : 'Este dispositivo no tiene sensor de pasos.',
    };
  }
  return { mode: 'none', background: false, label: 'La web no tiene podómetro.' };
}

export async function hasHealthConnectPermission() {
  const hc = await ensureHealthConnect();
  if (!hc) return false;
  try {
    const granted = await hc.getGrantedPermissions();
    return granted.some(
      (p) => p.recordType === 'Steps' && p.accessType === 'read',
    );
  } catch (err) {
    return false;
  }
}

export async function requestStepsPermission() {
  if (Platform.OS === 'android') {
    const hc = await ensureHealthConnect();
    if (hc) {
      try {
        const granted = await hc.requestPermission([STEPS_PERMISSION]);
        return granted.some((p) => p.recordType === 'Steps');
      } catch (err) {
        return false;
      }
    }
  }
  try {
    const perm = await Pedometer.requestPermissionsAsync();
    return perm?.granted !== false;
  } catch (err) {
    return false;
  }
}

export function openHealthConnect() {
  const hc = loadHealthConnect();
  try {
    hc?.openHealthConnectSettings?.();
  } catch (err) {
    /* noop */
  }
}

/**
 * Devuelve { 'YYYY-MM-DD': pasos } para los últimos `days` días,
 * incluidos los días en que la app estuvo cerrada.
 */
export async function readHistory(days = 7) {
  const end = new Date();
  const start = startOfDay(addDays(end, -(days - 1)));

  if (Platform.OS === 'android') {
    const hc = await ensureHealthConnect();
    if (hc && (await hasHealthConnectPermission())) {
      try {
        const buckets = await hc.aggregateGroupByPeriod({
          recordType: 'Steps',
          timeRangeFilter: {
            operator: 'between',
            startTime: start.toISOString(),
            endTime: end.toISOString(),
          },
          timeRangeSlicer: { period: 'DAYS', length: 1 },
        });
        const out = {};
        for (const bucket of buckets || []) {
          const key = dayKey(new Date(bucket.startTime));
          out[key] = Math.round(bucket.result?.COUNT_TOTAL || 0);
        }
        return out;
      } catch (err) {
        return {};
      }
    }
    return {};
  }

  if (Platform.OS === 'ios') {
    const out = {};
    for (let i = 0; i < days; i += 1) {
      const dayStart = startOfDay(addDays(end, -i));
      const dayEnd = i === 0 ? end : addDays(dayStart, 1);
      try {
        const res = await Pedometer.getStepCountAsync(dayStart, dayEnd);
        out[dayKey(dayStart)] = Math.round(res?.steps || 0);
      } catch (err) {
        break;
      }
    }
    return out;
  }

  return {};
}

export async function readToday() {
  const history = await readHistory(1);
  return history[dayKey()] ?? null;
}

/**
 * Sensor en vivo. Sólo se usa como respaldo (Android sin Health Connect):
 * no se suscribe si ya tenemos lectura histórica, así no consume batería.
 */
export function watchLiveSteps(onDelta) {
  let last = null;
  let subscription;
  try {
    subscription = Pedometer.watchStepCount((result) => {
      if (last == null) {
        last = result.steps;
        return;
      }
      const delta = result.steps - last;
      last = result.steps;
      if (delta > 0) onDelta(delta);
    });
  } catch (err) {
    return () => {};
  }
  return () => subscription?.remove?.();
}
