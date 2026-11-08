// Sanity-checks rhumb bearings on familiar pairs. Run with: npm run test:geo
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { angleDiff, headingLabel, rhumbBearing } from '../src/games/compass/geo.ts';

type C = { name: string; lat: number; lon: number };
const countries: C[] = JSON.parse(readFileSync(new URL('../src/data/countries.json', import.meta.url), 'utf8'));
const get = (name: string) => {
  const c = countries.find((x) => x.name === name);
  assert.ok(c, `missing ${name}`);
  return c;
};

const cases: [string, string, number][] = [
  ['Denmark', 'Italy', 172],
  ['Denmark', 'Japan', 104],
  ['Brazil', 'Nigeria', 60],
  ['India', 'Kenya', 235],
  ['Australia', 'Chile', 95],
  ['Egypt', 'Norway', 340],
  ['Canada', 'Mexico', 165],
];

for (const [a, b, expected] of cases) {
  const bearing = rhumbBearing(get(a), get(b));
  console.log(`${a} -> ${b}: ${bearing.toFixed(1)}° (${headingLabel(bearing)}), expected ~${expected}°`);
  assert.ok(angleDiff(bearing, expected) < 12, `${a} -> ${b} off by ${angleDiff(bearing, expected).toFixed(1)}°`);
}

assert.equal(angleDiff(350, 10), 20);
assert.equal(angleDiff(10, 190), 180);
console.log('geo checks passed');
