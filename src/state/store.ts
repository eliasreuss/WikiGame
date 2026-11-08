import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { dealRounds, pairQids, shiftDateKey, dateKey, type CompassPair } from '../games/compass/daily';
import { ROUNDS_PER_DAY } from '../games/compass/scoring';
import { ROUNDS_PER_GAME as ORIGIN_ROUNDS } from '../games/origin/scoring';

export type RoundResult = { fromQid: string; toQid: string; guess: number; truth: number; score: number };
export type DayResult = { rounds: RoundResult[]; pairs?: CompassPair[]; demo?: boolean };
export type OriginRoundResult = { itemQid: string; originQid: string; guessLat: number; guessLon: number; km: number; score: number };
/** One free-play game of Origin; a new one starts whenever the last is finished. */
export type OriginRun = { itemQids: string[]; rounds: OriginRoundResult[] };

function applyDeal(s: { history: Record<string, DayResult>; compassSeen?: string[] }, key: string, avoid: Set<string>, rounds: RoundResult[], keepOut: Set<string> = new Set()) {
  let deal = dealRounds(avoid);
  let base = [...avoid];
  if (!deal && keepOut.size > 0) {
    deal = dealRounds(keepOut);
    base = [...keepOut];
  }
  if (!deal) {
    base = [];
    deal = dealRounds(new Set());
  }
  if (!deal) return s;
  return {
    compassSeen: [...new Set([...base, ...pairQids(deal)])],
    history: { ...s.history, [key]: { rounds, pairs: deal.map((round) => ({ fromQid: round.from.qid, toQid: round.to.qid })) } },
  };
}

type State = {
  playerName: string;
  history: Record<string, DayResult>;
  /** Country ids already dealt in Compass. Cleared once a fresh game no longer fits. */
  compassSeen: string[];
  originRun: OriginRun | null;
  originBest: number;
  hydrated: boolean;
  recordRound: (key: string, result: RoundResult) => void;
  /** First game today. Keeps an in-progress or finished deal stable across reloads. */
  ensureCompassDeal: (key: string) => void;
  /** Prototype replay: the next unused countries, or a fresh shuffle once the pool is used up. */
  replayCompass: (key: string) => void;
  startOriginRun: (itemQids: string[]) => void;
  recordOriginRound: (result: OriginRoundResult) => void;
  seedDemoHistory: () => void;
};

export const useGameStore = create<State>()(
  persist(
    (set, get) => ({
      playerName: 'Elias',
      history: {},
      compassSeen: [],
      originRun: null,
      originBest: 0,
      hydrated: false,
      recordRound: (key, result) =>
        set((s) => {
          const day = s.history[key] ?? { rounds: [] };
          if (day.rounds.length >= ROUNDS_PER_DAY) return s;
          return { history: { ...s.history, [key]: { rounds: [...day.rounds, result], pairs: day.pairs } } };
        }),
      ensureCompassDeal: (key) =>
        set((s) => {
          const day = s.history[key];
          if (day?.pairs?.length === ROUNDS_PER_DAY) return s;
          if (day && day.rounds.length > 0) return s;
          return applyDeal(s, key, new Set(s.compassSeen ?? []), day?.rounds ?? []);
        }),
      replayCompass: (key) =>
        set((s) => {
          const day = s.history[key];
          const seen = new Set(s.compassSeen ?? []);
          for (const pair of day?.pairs ?? []) {
            seen.add(pair.fromQid);
            seen.add(pair.toQid);
          }
          for (const round of day?.rounds ?? []) {
            if (round.fromQid) seen.add(round.fromQid);
            if (round.toQid) seen.add(round.toQid);
          }
          const justPlayed = new Set<string>();
          for (const pair of day?.pairs ?? []) {
            justPlayed.add(pair.fromQid);
            justPlayed.add(pair.toQid);
          }
          for (const round of day?.rounds ?? []) {
            if (round.fromQid) justPlayed.add(round.fromQid);
            if (round.toQid) justPlayed.add(round.toQid);
          }
          return applyDeal(s, key, seen, [], justPlayed);
        }),
      startOriginRun: (itemQids) => set({ originRun: { itemQids, rounds: [] } }),
      recordOriginRound: (result) =>
        set((s) => {
          const run = s.originRun;
          if (!run || run.rounds.length >= ORIGIN_ROUNDS) return s;
          const next = { ...run, rounds: [...run.rounds, result] };
          const best = isOriginComplete(next) ? Math.max(s.originBest, originTotal(next)) : s.originBest;
          return { originRun: next, originBest: best };
        }),
      // Gives a first-time visitor a believable streak so the week strip isn't empty.
      seedDemoHistory: () => {
        if (Object.keys(get().history).length > 0) return;
        const today = dateKey();
        const history: Record<string, DayResult> = {};
        [1, 2, 3, 5].forEach((ago, i) => {
          const scores = [930, 870, 610, 990, 780].map((v) => Math.max(0, v - i * 37));
          history[shiftDateKey(today, -ago)] = {
            demo: true,
            rounds: scores.map((score) => ({ fromQid: '', toQid: '', guess: 0, truth: 0, score })),
          };
        });
        set({ history });
      },
    }),
    {
      name: 'wikidaily-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ playerName, history, compassSeen, originRun, originBest }) => ({ playerName, history, compassSeen, originRun, originBest }),
      onRehydrateStorage: () => () => {
        useGameStore.setState({ hydrated: true });
        useGameStore.getState().seedDemoHistory();
      },
    },
  ),
);

export function dayTotal(day?: DayResult) {
  return day ? day.rounds.reduce((sum, r) => sum + r.score, 0) : 0;
}

export function isComplete(day?: DayResult) {
  return !!day && day.rounds.length >= ROUNDS_PER_DAY;
}

export function originTotal(run?: OriginRun | null) {
  return run ? run.rounds.reduce((sum, r) => sum + r.score, 0) : 0;
}

export function isOriginComplete(run?: OriginRun | null) {
  return !!run && run.rounds.length >= ORIGIN_ROUNDS;
}

/** Consecutive completed days ending today (or yesterday, if today isn't done yet). */
export function currentStreak(history: Record<string, DayResult>, today = dateKey()) {
  let key = isComplete(history[today]) ? today : shiftDateKey(today, -1);
  let streak = 0;
  while (isComplete(history[key])) {
    streak++;
    key = shiftDateKey(key, -1);
  }
  return streak;
}
