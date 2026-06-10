import { DestinyMatrixBlueprint } from '../types/blueprint';

/**
 * Calculates Destiny Matrix Arcana (uses a mod 22 system where 22 = 22, 0 = 22, >22 = reduce or mod)
 * Different schools of destiny matrix do this differently, we use simple reduction to <= 22
 */
function reduceToArcana(num: number): number {
  if (num <= 22 && num > 0) return num;
  if (num === 0) return 22;
  
  // Standard reduction: sum digits if > 22
  const sum = num.toString().split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
  if (sum <= 22) return sum;
  return reduceToArcana(sum);
}

const reduce22 = (n: number): number => {
  let num = n;
  while (num > 22) {
    num = String(num)
      .split("")
      .reduce((sum, digit) => sum + parseInt(digit, 10), 0);
  }
  return num;
};

export const calculateDestinyMatrix = (birthDate: string) => {
  const [year, month, day] = birthDate.split("-").map(Number);

  const dayPoint = reduce22(day);
  const monthPoint = reduce22(month);

  const yearDigitsSum = String(year)
    .split("")
    .reduce((sum, digit) => sum + parseInt(digit, 10), 0);
  const yearPoint = reduce22(yearDigitsSum);

  const destinyPoint = reduce22(dayPoint + monthPoint + yearPoint);
  const arcanaCenter = reduce22(dayPoint + monthPoint + yearPoint + destinyPoint);

  return {
    dayPoint,
    monthPoint,
    yearPoint,
    destinyPoint,
    arcanaCenter,
    center: arcanaCenter,
    calculationStatus: "completed",
  };
};
