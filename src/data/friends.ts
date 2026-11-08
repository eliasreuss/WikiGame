import { hashString, mulberry32 } from '../games/compass/daily';
import { ROUNDS_PER_DAY } from '../games/compass/scoring';

export type Friend = { id: string; name: string; initials: string; skill: number };

export const FRIENDS: Friend[] = [
  { id: 'maja', name: 'Karolina', initials: 'KA', skill: 0.86 },
  { id: 'oliver', name: 'Xinxin', initials: 'XX', skill: 0.78 },
  { id: 'sofia', name: 'Jonusz', initials: 'JO', skill: 0.9 },
  { id: 'noah', name: 'Yvonne', initials: 'YV', skill: 0.62 },
  { id: 'ida', name: 'Elias', initials: 'EL', skill: 0.71 },
  { id: 'lukas', name: 'Lukas', initials: 'LU', skill: 0.55 },
];

export type FriendDay = { friend: Friend; played: boolean; rounds: number[]; total: number; streak: number };

/** Deterministic fake results so the leaderboard looks lived-in. */
export function friendDay(friend: Friend, key: string): FriendDay {
  const rand = mulberry32(hashString(`${friend.id}:${key}`));
  const played = rand() < 0.85;
  const rounds = Array.from({ length: ROUNDS_PER_DAY }, () => {
    const blunder = rand() < 0.45 * (1.25 - friend.skill);
    const off = blunder ? 30 + rand() * 90 : Math.abs(rand() + rand() + rand() - 1.5) * 110 * (1.25 - friend.skill);
    return Math.round(1000 * Math.max(0, Math.cos((off * Math.PI) / 180)));
  });
  const streak = 1 + Math.floor(mulberry32(hashString(friend.id))() * 40);
  return { friend, played, rounds: played ? rounds : [], total: played ? rounds.reduce((a, b) => a + b, 0) : 0, streak };
}
