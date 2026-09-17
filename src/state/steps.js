import React, { createContext, useContext } from 'react';
import { usePedometer } from '../hooks/usePedometer';

const StepsContext = createContext(null);

/** Un solo podómetro para toda la app: un permiso, una sincronización. */
export function StepsProvider({ children }) {
  const value = usePedometer();
  return <StepsContext.Provider value={value}>{children}</StepsContext.Provider>;
}

export function useSteps() {
  const ctx = useContext(StepsContext);
  if (!ctx) throw new Error('useSteps debe usarse dentro de <StepsProvider>');
  return ctx;
}
