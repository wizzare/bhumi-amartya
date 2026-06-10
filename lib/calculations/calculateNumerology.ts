import { reduceNumber, calculateLifePath } from './calculateLifePath';
import { NumerologyBlueprint } from '../types/blueprint';

/**
 * Letter to number mapping for numerology
 */
const letterValues: Record<string, number> = {
  a: 1, j: 1, s: 1,
  b: 2, k: 2, t: 2,
  c: 3, l: 3, u: 3,
  d: 4, m: 4, v: 4,
  e: 5, n: 5, w: 5,
  f: 6, o: 6, x: 6,
  g: 7, p: 7, y: 7,
  h: 8, q: 8, z: 8,
  i: 9, r: 9
};

const isVowel = (char: string) => ['a', 'e', 'i', 'o', 'u'].includes(char);
const isConsonant = (char: string) => !isVowel(char) && /[a-z]/.test(char);

function calculateNameNumber(name: string, filter?: (c: string) => boolean): number {
  const cleanName = name.toLowerCase().replace(/[^a-z]/g, '');
  let sum = 0;
  
  for (const char of cleanName) {
    if (!filter || filter(char)) {
      sum += letterValues[char] || 0;
    }
  }
  
  return reduceNumber(sum);
}

export function calculateNumerology(name: string, birthDate: string): NumerologyBlueprint {
  const lifePathResult = calculateLifePath(birthDate);
  const lifePath = lifePathResult.number;
  const expression = reduceNumber(calculateNameNumber(name));
  const soulUrge = calculateNameNumber(name, isVowel);
  const personality = calculateNameNumber(name, isConsonant);
  
  return {
    lifePath,
    expression,
    soulUrge,
    personality
  };
}
