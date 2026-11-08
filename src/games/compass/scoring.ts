import { color } from '../../theme/tokens';
import { angleDiff } from './geo';

export const MAX_ROUND_SCORE = 1000;
export const ROUNDS_PER_DAY = 5;

/** Cosine falloff: generous near the target, nothing past 90° off. */
export function scoreFor(guess: number, truth: number) {
  const diff = angleDiff(guess, truth);
  return Math.round(MAX_ROUND_SCORE * Math.max(0, Math.cos((diff * Math.PI) / 180)));
}

/** `color` fills marks and bars, `on` is a glyph drawn over it, `text` sits on `tint`. */
export type Band = { key: 'bullseye' | 'close' | 'warm' | 'lost'; title: string; color: string; on: string; tint: string; text: string };

const BANDS: Record<Band['key'], Band> = {
  bullseye: { key: 'bullseye', title: 'Bullseye', color: color.success, on: '#fff', tint: color.successTint, text: color.successInk },
  close: { key: 'close', title: 'Close', color: color.warning, on: '#fff', tint: color.warningTint, text: color.warning },
  warm: { key: 'warm', title: 'Getting warm', color: color.warning, on: '#fff', tint: color.warningTint, text: color.warning },
  lost: { key: 'lost', title: 'Lost at sea', color: color.danger, on: '#fff', tint: color.dangerTint, text: color.danger },
};

export function bandFor(score: number): Band {
  if (score >= 950) return BANDS.bullseye;
  if (score >= 800) return BANDS.close;
  if (score >= 400) return BANDS.warm;
  return BANDS.lost;
}

/** A whole day, judged on its average round. Green once the day was genuinely good, about 38° off or better. */
export function dayMark(total: number): { color: string; on: string } {
  const avg = total / ROUNDS_PER_DAY;
  if (avg >= 780) return { color: color.success, on: '#fff' };
  if (avg >= 400) return { color: color.warning, on: '#fff' };
  return { color: color.danger, on: '#fff' };
}
