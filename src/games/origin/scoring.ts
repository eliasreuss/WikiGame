import { color } from '../../theme/tokens';

export const MAX_ROUND_SCORE = 1000;
export const ROUNDS_PER_GAME = 5;

/** A pin inside the right country scores in full. Outside it, points fall off with distance to that country's border. */
export function scoreForKm(km: number) {
  if (km <= 0) return MAX_ROUND_SCORE;
  return Math.round(900 * Math.exp(-km / 1200));
}

export type OriginBand = {
  key: 'spot' | 'close' | 'region' | 'far';
  title: string;
  color: string;
  on: string;
  tint: string;
  text: string;
};

const BANDS: Record<OriginBand['key'], OriginBand> = {
  spot: { key: 'spot', title: 'Right country', color: color.success, on: '#fff', tint: color.successTint, text: color.successInk },
  close: { key: 'close', title: 'Just next door', color: color.warning, on: '#fff', tint: color.warningTint, text: color.warning },
  region: { key: 'region', title: 'In the region', color: color.warning, on: '#fff', tint: color.warningTint, text: color.warning },
  far: { key: 'far', title: 'Far off', color: color.danger, on: '#fff', tint: color.dangerTint, text: color.danger },
};

/** `km` is 0 when the pin is inside the country, otherwise the distance to its border. */
export function bandForKm(km: number): OriginBand {
  if (km <= 0) return BANDS.spot;
  if (km <= 500) return BANDS.close;
  if (km <= 1500) return BANDS.region;
  return BANDS.far;
}

export function formatKm(km: number) {
  return `${Math.max(1, Math.round(km)).toLocaleString('en-US')} km`;
}
