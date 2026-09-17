import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AVATARS, demoFriends } from '../data/demo';
import { dayKey, addDays, isActiveRange } from '../utils/dates';
import { randomId, inviteCode } from '../utils/geo';

const STORAGE_KEY = 'pasos:state:v2';

export const ME = 'me';

function defaultTournaments(friends) {
  const start = addDays(new Date(), -2);
  const end = addDays(new Date(), 5);
  return [
    {
      id: randomId('trn'),
      name: 'Liga de la semana',
      icon: 'trophy',
      prize: 'El último del ranking paga el café',
      code: inviteCode(),
      startISO: start.toISOString(),
      endISO: end.toISOString(),
      createdBy: ME,
      participantIds: [ME, ...friends.slice(0, 4).map((f) => f.id)],
    },
  ];
}

function initialState() {
  const friends = demoFriends();
  return {
    ready: false,
    profile: {
      id: ME,
      name: '',
      avatar: AVATARS[0],
      code: inviteCode(),
      goal: 10000,
      onboarded: false,
    },
    history: {},
    friends,
    tournaments: defaultTournaments(friends),
    favorites: [],
    settings: { manualMode: false, lastCenter: null },
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'hydrate':
      return { ...state, ...action.payload, ready: true };
    case 'ready':
      return { ...state, ready: true };
    case 'profile':
      return { ...state, profile: { ...state.profile, ...action.payload } };
    case 'setSteps': {
      const { day, steps } = action.payload;
      const current = state.history[day] || 0;
      if (steps <= current && !action.payload.force) return state;
      return { ...state, history: { ...state.history, [day]: Math.max(0, Math.round(steps)) } };
    }
    case 'addSteps': {
      const day = dayKey();
      const current = state.history[day] || 0;
      return {
        ...state,
        history: { ...state.history, [day]: Math.max(0, current + action.payload) },
      };
    }
    case 'addFriend':
      if (state.friends.some((f) => f.code === action.payload.code)) return state;
      return { ...state, friends: [...state.friends, action.payload] };
    case 'removeFriend':
      return {
        ...state,
        friends: state.friends.filter((f) => f.id !== action.payload),
        tournaments: state.tournaments.map((t) => ({
          ...t,
          participantIds: t.participantIds.filter((id) => id !== action.payload),
        })),
      };
    case 'addTournament':
      return { ...state, tournaments: [action.payload, ...state.tournaments] };
    case 'updateTournament':
      return {
        ...state,
        tournaments: state.tournaments.map((t) =>
          t.id === action.payload.id ? { ...t, ...action.payload.changes } : t,
        ),
      };
    case 'removeTournament':
      return { ...state, tournaments: state.tournaments.filter((t) => t.id !== action.payload) };
    case 'toggleFavorite': {
      const exists = state.favorites.includes(action.payload);
      return {
        ...state,
        favorites: exists
          ? state.favorites.filter((id) => id !== action.payload)
          : [...state.favorites, action.payload],
      };
    }
    case 'settings':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'reset':
      return { ...initialState(), ready: true };
    default:
      return state;
  }
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const hydrated = useRef(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!alive) return;
        if (raw) {
          const parsed = JSON.parse(raw);
          dispatch({ type: 'hydrate', payload: parsed });
        } else {
          dispatch({ type: 'ready' });
        }
      } catch (err) {
        dispatch({ type: 'ready' });
      } finally {
        hydrated.current = true;
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!state.ready || !hydrated.current) return;
    const { ready, ...persisted } = state;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(persisted)).catch(() => {});
  }, [state]);

  const actions = useMemo(
    () => ({
      setProfile: (payload) => dispatch({ type: 'profile', payload }),
      finishOnboarding: (payload) =>
        dispatch({ type: 'profile', payload: { ...payload, onboarded: true } }),
      setStepsForDay: (day, steps, force = false) =>
        dispatch({ type: 'setSteps', payload: { day, steps, force } }),
      addSteps: (steps) => dispatch({ type: 'addSteps', payload: steps }),
      addFriend: (friend) => dispatch({ type: 'addFriend', payload: friend }),
      removeFriend: (id) => dispatch({ type: 'removeFriend', payload: id }),
      createTournament: (t) => dispatch({ type: 'addTournament', payload: t }),
      updateTournament: (id, changes) =>
        dispatch({ type: 'updateTournament', payload: { id, changes } }),
      removeTournament: (id) => dispatch({ type: 'removeTournament', payload: id }),
      toggleFavorite: (id) => dispatch({ type: 'toggleFavorite', payload: id }),
      setSettings: (payload) => dispatch({ type: 'settings', payload }),
      reset: () => dispatch({ type: 'reset' }),
    }),
    [],
  );

  const value = useMemo(() => ({ ...state, ...actions }), [state, actions]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore debe usarse dentro de <StoreProvider>');
  return ctx;
}

/** Pasos de un participante en un rango de fechas. */
export function stepsInRange(entity, startISO, endISO) {
  const history = entity?.history || {};
  const start = new Date(startISO);
  const end = new Date(endISO);
  let total = 0;
  for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
    total += history[dayKey(d)] || 0;
  }
  return total;
}

export function buildRanking({ profile, history, friends, tournament }) {
  const me = {
    id: ME,
    name: profile.name || 'Vos',
    avatar: profile.avatar,
    isMe: true,
    steps: stepsInRange({ history }, tournament.startISO, tournament.endISO),
  };
  const others = friends
    .filter((f) => tournament.participantIds.includes(f.id))
    .map((f) => ({
      id: f.id,
      name: f.name,
      avatar: f.avatar,
      isMe: false,
      steps: stepsInRange(f, tournament.startISO, tournament.endISO),
    }));
  const all = tournament.participantIds.includes(ME) ? [me, ...others] : others;
  return all
    .sort((a, b) => b.steps - a.steps)
    .map((p, i) => ({ ...p, position: i + 1 }));
}

export function tournamentStatus(t) {
  if (isActiveRange(t.startISO, t.endISO)) return 'activo';
  return new Date(t.startISO).getTime() > Date.now() ? 'proximo' : 'terminado';
}
