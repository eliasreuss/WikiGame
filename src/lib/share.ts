import * as Clipboard from 'expo-clipboard';
import { useEffect, useState } from 'react';
import { Platform, Share } from 'react-native';
import { puzzleNumber } from '../games/compass/daily';
import { bandFor, MAX_ROUND_SCORE, ROUNDS_PER_DAY } from '../games/compass/scoring';
import { bandForKm, MAX_ROUND_SCORE as ORIGIN_MAX, ROUNDS_PER_GAME as ORIGIN_ROUNDS } from '../games/origin/scoring';
import type { DayResult, OriginRun } from '../state/store';

const SQUARE: Record<string, string> = { bullseye: '🟩', close: '🟦', warm: '🟨', lost: '🟥' };
const ORIGIN_SQUARE: Record<string, string> = { spot: '🟩', close: '🟧', region: '🟨', far: '🟥' };

export function shareText(key: string, day: DayResult) {
  const total = day.rounds.reduce((s, r) => s + r.score, 0);
  const squares = day.rounds.map((r) => SQUARE[bandFor(r.score).key]).join('');
  return [
    `WikiDaily Compass #${puzzleNumber(key)}`,
    `${total.toLocaleString('en-US')}/${(MAX_ROUND_SCORE * ROUNDS_PER_DAY).toLocaleString('en-US')}`,
    squares,
    'Point the way: wikidaily.app',
  ].join('\n');
}

export function shareOriginText(run: OriginRun) {
  const total = run.rounds.reduce((s, r) => s + r.score, 0);
  const squares = run.rounds.map((r) => ORIGIN_SQUARE[bandForKm(r.km).key]).join('');
  return ['WikiDaily Origin', `${total.toLocaleString('en-US')}/${(ORIGIN_MAX * ORIGIN_ROUNDS).toLocaleString('en-US')}`, squares, 'Drop the pin: wikidaily.app'].join('\n');
}

/** Native share sheet where available, clipboard otherwise. Returns what happened. */
export async function shareResult(text: string): Promise<'shared' | 'copied'> {
  if (Platform.OS === 'web') {
    const nav = globalThis.navigator as Navigator | undefined;
    if (nav?.share && /Mobi|Android/i.test(nav.userAgent)) {
      try {
        await nav.share({ text });
        return 'shared';
      } catch {
        // Fall through to clipboard when the user dismisses or sharing is blocked.
      }
    }
    await Clipboard.setStringAsync(text);
    return 'copied';
  }
  await Share.share({ message: text });
  return 'shared';
}

export function useCountdownToMidnight() {
  const calc = () => {
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const s = Math.max(0, Math.floor((next.getTime() - now.getTime()) / 1000));
    const hh = String(Math.floor(s / 3600)).padStart(2, '0');
    const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  };
  const [value, setValue] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setValue(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return value;
}
