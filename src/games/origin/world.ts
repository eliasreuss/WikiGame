import { WORLD } from '../../data/worldmap';
import { distanceKm, mercY, type LatLon } from '../compass/geo';

export const MAP_W = WORLD.width;
export const MAP_H = WORLD.height;
const Y_TOP = mercY(WORLD.latMax);
const Y_SPAN = Y_TOP - mercY(WORLD.latMin);

export type MapPoint = { x: number; y: number };

export function project({ lat, lon }: LatLon): MapPoint {
  const clamped = Math.max(WORLD.latMin, Math.min(WORLD.latMax, lat));
  return { x: ((lon + 180) / 360) * MAP_W, y: ((Y_TOP - mercY(clamped)) / Y_SPAN) * MAP_H };
}

export function unproject({ x, y }: MapPoint): LatLon {
  const merc = Y_TOP - (y / MAP_H) * Y_SPAN;
  return {
    lat: (2 * Math.atan(Math.exp(merc)) - Math.PI / 2) * (180 / Math.PI),
    lon: Math.max(-180, Math.min(180, (x / MAP_W) * 360 - 180)),
  };
}

type Shape = { rings: number[][]; minX: number; minY: number; maxX: number; maxY: number };

const shapes: (Shape | undefined)[] = [];

/** Parses a generated path (absolute M, relative integer l, z) into flat x,y rings. */
function shape(index: number): Shape {
  const cached = shapes[index];
  if (cached) return cached;
  const s: Shape = { rings: [], minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  const tokens = WORLD.countries[index].d.match(/[Mlz]|-?\d+/g) ?? [];
  let ring: number[] = [];
  let x = 0;
  let y = 0;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t === 'z') {
      if (ring.length) s.rings.push(ring);
      ring = [];
      continue;
    }
    if (t === 'M') {
      x = Number(tokens[++i]);
      y = Number(tokens[++i]);
    } else if (t === 'l') {
      x += Number(tokens[++i]);
      y += Number(tokens[++i]);
    } else continue;
    ring.push(x, y);
    if (x < s.minX) s.minX = x;
    if (x > s.maxX) s.maxX = x;
    if (y < s.minY) s.minY = y;
    if (y > s.maxY) s.maxY = y;
  }
  shapes[index] = s;
  return s;
}

function contains(s: Shape, { x, y }: MapPoint) {
  if (x < s.minX || x > s.maxX || y < s.minY || y > s.maxY) return false;
  let inside = false;
  for (const ring of s.rings) {
    for (let i = 0, j = ring.length - 2; i < ring.length; j = i, i += 2) {
      const xi = ring[i];
      const yi = ring[i + 1];
      const xj = ring[j];
      const yj = ring[j + 1];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
  }
  return inside;
}

export const COUNTRY_COUNT = WORLD.countries.length;

export function countryName(index: number) {
  return WORLD.countries[index]?.name ?? '';
}

export function countryPath(index: number) {
  return WORLD.countries[index]?.d ?? '';
}

export function countryBounds(index: number) {
  const { minX, minY, maxX, maxY } = shape(index);
  return { minX, minY, maxX, maxY };
}

export function countryIndex(name: string) {
  return WORLD.countries.findIndex((c) => c.name === name);
}

/** Bounds of the single landmass of a country nearest `p`, so Alaska or Hawaii don't stretch the frame. */
export function landmassBounds(index: number, p: MapPoint) {
  let best = Infinity;
  let pick: number[] = [];
  for (const ring of shape(index).rings) {
    for (let i = 0; i < ring.length; i += 2) {
      const d = (ring[i] - p.x) ** 2 + (ring[i + 1] - p.y) ** 2;
      if (d < best) {
        best = d;
        pick = ring;
      }
    }
  }
  const b = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  for (let i = 0; i < pick.length; i += 2) {
    b.minX = Math.min(b.minX, pick[i]);
    b.maxX = Math.max(b.maxX, pick[i]);
    b.minY = Math.min(b.minY, pick[i + 1]);
    b.maxY = Math.max(b.maxY, pick[i + 1]);
  }
  return b;
}

/** Index of the country under a map point, or -1 for sea. */
export function countryAt(p: MapPoint) {
  for (let i = 0; i < COUNTRY_COUNT; i++) if (contains(shape(i), p)) return i;
  return -1;
}

/** The point on a country's outline closest to `from`, and how far away it is. */
export function nearestOnCountry(index: number, from: LatLon) {
  let best = { km: Infinity, point: { x: 0, y: 0 } };
  for (const ring of shape(index).rings) {
    for (let i = 0; i < ring.length; i += 2) {
      const point = { x: ring[i], y: ring[i + 1] };
      const km = distanceKm(from, unproject(point));
      if (km < best.km) best = { km, point };
    }
  }
  return best;
}

const placeCountries = new Map<string, number>();

/** Historical places whose Wikidata point sits on a modern border, keyed by QID. */
const MODERN_COUNTRY: Record<string, string> = {
  Q11774: 'India', // Gupta Empire; its point falls just inside Bangladesh
};

/** The modern country a coordinate sits in; historical places such as the Ottoman Empire resolve to wherever their point falls today. */
export function countryOf(at: LatLon & { qid?: string }) {
  const key = at.qid ?? `${at.lat},${at.lon}`;
  const cached = placeCountries.get(key);
  if (cached !== undefined) return cached;
  const p = project(at);
  const override = at.qid ? MODERN_COUNTRY[at.qid] : undefined;
  let index = override ? WORLD.countries.findIndex((c) => c.name === override) : countryAt(p);
  if (index < 0) {
    let best = Infinity;
    for (let i = 0; i < COUNTRY_COUNT; i++) {
      for (const ring of shape(i).rings) {
        for (let j = 0; j < ring.length; j += 2) {
          const d = (ring[j] - p.x) ** 2 + (ring[j + 1] - p.y) ** 2;
          if (d < best) {
            best = d;
            index = i;
          }
        }
      }
    }
  }
  placeCountries.set(key, index);
  return index;
}
