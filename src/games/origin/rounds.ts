import type { OriginItem, OriginPlace } from '../../data/origins';
import { ORIGINS } from '../../data/origins';
import { distanceKm, type LatLon } from '../compass/geo';
import { ROUNDS_PER_GAME } from './scoring';
import { countryAt, countryOf, nearestOnCountry, project, type MapPoint } from './world';

export const ORIGIN_BY_QID = new Map(ORIGINS.map((item) => [item.qid, item]));

export type Judgement = {
  place: OriginPlace;
  /** Index into the world map of the place's modern country. */
  country: number;
  /** 0 when the pin is inside the country, otherwise kilometres to its border. */
  km: number;
  /** Closest border point to the pin, when it missed. */
  border: MapPoint | null;
};

/**
 * Scores a pin against every country Wikidata lists for the item (coffee lists Ethiopia and Yemen)
 * and keeps the best one.
 */
export function judge(item: OriginItem, pin: LatLon): Judgement {
  const pinCountry = countryAt(project(pin));
  let best: Judgement | null = null;
  for (const place of item.places) {
    const country = countryOf(place);
    if (country === pinCountry) return { place, country, km: 0, border: null };
    const { km, point } = nearestOnCountry(country, pin);
    if (!best || km < best.km) best = { place, country, km: Math.max(1, km), border: point };
  }
  return best!;
}

/** Other listed origins far enough away to be a different answer, not a nearby region of the same place. */
export function alsoListed(item: OriginItem, chosen: OriginPlace) {
  return item.places.filter((p) => p.qid !== chosen.qid && distanceKm(p, chosen) > 1500);
}

/** A fresh random game: five items from different countries, skipping the ones from the last game. */
export function pickItems(avoid: string[] = []): string[] {
  const skip = new Set(avoid);
  const pool = ORIGINS.filter((item) => !skip.has(item.qid));
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const used = new Set<number>();
  const picked: string[] = [];
  for (const item of pool) {
    const country = countryOf(item.places[0]);
    if (used.has(country)) continue;
    used.add(country);
    picked.push(item.qid);
    if (picked.length === ROUNDS_PER_GAME) break;
  }
  return picked;
}
