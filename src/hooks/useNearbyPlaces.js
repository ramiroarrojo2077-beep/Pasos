import { useCallback, useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { fetchNearbyPlaces, demoPlacesAround } from '../services/places';
import { DEFAULT_CENTER } from '../data/demo';
import { distanceMeters } from '../utils/geo';

const LOCATION_TIMEOUT = 10000;

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}

export function useNearbyPlaces() {
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [places, setPlaces] = useState(() => demoPlacesAround(DEFAULT_CENTER));
  const [source, setSource] = useState('demo');
  const [motivo, setMotivo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationDenied, setLocationDenied] = useState(false);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  const load = useCallback(async (coords) => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const { places: found, source: src, motivo: porque } = await fetchNearbyPlaces(coords);
      if (id !== requestId.current) return;
      setPlaces(found);
      setSource(src);
      setMotivo(porque ?? null);
    } catch (err) {
      if (id !== requestId.current) return;
      setPlaces(demoPlacesAround(coords));
      setSource('demo');
      setMotivo('sin-conexion');
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);

  /** Pide la ubicación; si tarda o la rechazan, seguimos con el centro por defecto. */
  const locate = useCallback(async () => {
    let coords = null;
    try {
      const { status } = await withTimeout(
        Location.requestForegroundPermissionsAsync(),
        LOCATION_TIMEOUT,
      );
      if (status === 'granted') {
        const pos = await withTimeout(
          Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
          LOCATION_TIMEOUT,
        );
        coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        setLocationDenied(false);
      } else {
        setLocationDenied(true);
      }
    } catch (err) {
      setLocationDenied(true);
    }
    const next = coords || DEFAULT_CENTER;
    setCenter(next);
    if (!coords) setPlaces(demoPlacesAround(next));
    await load(next);
    return next;
  }, [load]);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (alive) await locate();
    })();
    return () => {
      alive = false;
    };
  }, [locate]);

  const withDistance = places.map((p) => ({
    ...p,
    distance: p.distance ?? distanceMeters(center, p),
  }));

  return {
    center,
    places: withDistance,
    source,
    motivo,
    loading,
    locationDenied,
    error,
    reload: () => load(center),
    locate,
  };
}
