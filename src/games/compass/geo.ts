const toRad = (d: number) => (d * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;

export type LatLon = { lat: number; lon: number };

/** Signed longitude delta (radians) taking the short way around. */
export function shortLonDelta(fromLon: number, toLon: number) {
  let d = toRad(toLon - fromLon);
  if (Math.abs(d) > Math.PI) d -= Math.sign(d) * 2 * Math.PI;
  return d;
}

/** Rhumb-line bearing in degrees: the constant compass heading on a flat (Mercator) map. */
export function rhumbBearing(a: LatLon, b: LatLon) {
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const dPsi = Math.log(Math.tan(Math.PI / 4 + lat2 / 2) / Math.tan(Math.PI / 4 + lat1 / 2));
  const dLon = shortLonDelta(a.lon, b.lon);
  return (toDeg(Math.atan2(dLon, dPsi)) + 360) % 360;
}

/** Great-circle distance in km, used to keep daily pairs from being neighbours. */
export function distanceKm(a: LatLon, b: LatLon) {
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/** Smallest absolute difference between two headings, 0–180. */
export function angleDiff(a: number, b: number) {
  const d = Math.abs((((a - b) % 360) + 360) % 360);
  return d > 180 ? 360 - d : d;
}

export function normalizeDeg(d: number) {
  return ((d % 360) + 360) % 360;
}

const POINTS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

/** Whole degrees in 0–359, so 359.6 reads as 0 rather than 360. */
export function wholeDeg(deg: number) {
  return Math.round(normalizeDeg(deg)) % 360;
}

export function headingLabel(deg: number) {
  return POINTS[Math.round(normalizeDeg(deg) / 22.5) % 16];
}

/** Mercator y for a latitude in degrees. */
export function mercY(latDeg: number) {
  return Math.log(Math.tan(Math.PI / 4 + toRad(latDeg) / 2));
}
