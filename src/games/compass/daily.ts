import { COUNTRIES, type Country } from '../../data/countries';
import { distanceKm, rhumbBearing, shortLonDelta } from './geo';
import { ROUNDS_PER_DAY } from './scoring';

const LAUNCH = Date.UTC(2026, 0, 1);
const MIN_PAIR_KM = 800;
// Near-antipodal longitudes make "east" and "west" equally defensible on a flat map.
const MAX_LON_DELTA = (150 * Math.PI) / 180;

export function dateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function shiftDateKey(key: string, days: number) {
  const [y, m, d] = key.split('-').map(Number);
  return dateKey(new Date(y, m - 1, d + days));
}

export function puzzleNumber(key: string) {
  const [y, m, d] = key.split('-').map(Number);
  return Math.floor((Date.UTC(y, m - 1, d) - LAUNCH) / 86_400_000) + 1;
}

export function hashString(s: string) {
  let h = 1779033703 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

export function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Round = { from: Country; to: Country; bearing: number };
export type CompassPair = { fromQid: string; toQid: string };

const byQid = new Map(COUNTRIES.map((c) => [c.qid, c]));

function roundsFromPool(pool: Country[], rand: () => number): Round[] | null {
  const used = new Set<string>();
  const rounds: Round[] = [];
  let tries = 0;
  while (rounds.length < ROUNDS_PER_DAY && tries < 800) {
    tries += 1;
    const from = pool[Math.floor(rand() * pool.length)];
    const to = pool[Math.floor(rand() * pool.length)];
    if (!from || !to || from.qid === to.qid || used.has(from.qid) || used.has(to.qid)) continue;
    if (distanceKm(from, to) < MIN_PAIR_KM) continue;
    if (Math.abs(shortLonDelta(from.lon, to.lon)) > MAX_LON_DELTA) continue;
    used.add(from.qid);
    used.add(to.qid);
    rounds.push({ from, to, bearing: rhumbBearing(from, to) });
  }
  return rounds.length === ROUNDS_PER_DAY ? rounds : null;
}

/** The same five pairs for every player on a given date. */
export function dailyRounds(key: string): Round[] {
  return roundsFromPool(COUNTRIES, mulberry32(hashString(`compass:${key}`))) ?? [];
}

/**
 * Five new pairs whose countries are not in `avoid`. Returns null when the
 * remaining countries can't fill a game, so the caller can start the pool over.
 */
export function dealRounds(avoid: ReadonlySet<string>): Round[] | null {
  const pool = COUNTRIES.filter((c) => !avoid.has(c.qid));
  if (pool.length < ROUNDS_PER_DAY * 2) return null;
  return roundsFromPool(pool, Math.random);
}

export function roundsFromPairs(pairs: CompassPair[]): Round[] {
  const rounds: Round[] = [];
  for (const pair of pairs) {
    const from = byQid.get(pair.fromQid);
    const to = byQid.get(pair.toQid);
    if (!from || !to) return [];
    rounds.push({ from, to, bearing: rhumbBearing(from, to) });
  }
  return rounds;
}

export function pairQids(rounds: Round[]): string[] {
  return rounds.flatMap((round) => [round.from.qid, round.to.qid]);
}
