import React, { createContext, useContext } from 'react';
import { useNearbyPlaces } from '../hooks/useNearbyPlaces';

const PlacesContext = createContext(null);

export function PlacesProvider({ children }) {
  const value = useNearbyPlaces();
  return <PlacesContext.Provider value={value}>{children}</PlacesContext.Provider>;
}

export function usePlaces() {
  const ctx = useContext(PlacesContext);
  if (!ctx) throw new Error('usePlaces debe usarse dentro de <PlacesProvider>');
  return ctx;
}
