import { lifePathData } from "../data/numerology";
import { LifePathBlueprint } from "../types/blueprint";

const sumDigits = (numStr: string): number => {
  return numStr.split("").reduce((sum, digit) => sum + parseInt(digit, 10), 0);
};

const MASTER_REDUCTIONS: Record<number, number> = {
  11: 2,
  22: 4,
  33: 6,
};

export const reduceNumber = (num: number): number => {
  if (num === 11 || num === 22 || num === 33) {
    return num;
  }
  let sum = sumDigits(String(num));
  while (sum > 9) {
    if (sum === 11 || sum === 22 || sum === 33) return sum;
    sum = sumDigits(String(sum));
  }
  return sum;
};

const displayLifePathNumber = (num: number): string => {
  const reduction = MASTER_REDUCTIONS[num];
  return reduction ? `${num}/${reduction}` : String(num);
};

export const calculateLifePath = (birthDate: string): LifePathBlueprint => {
  const [year = "", month = "", day = ""] = birthDate.split("-");
  const monthNumber = reduceNumber(Number(month));
  const dayNumber = reduceNumber(Number(day));
  const yearNumber = reduceNumber(sumDigits(year));
  const lifePathNumber = reduceNumber(monthNumber + dayNumber + yearNumber);

  const data = (lifePathData as Record<string, any>)[lifePathNumber] || {
    role: "Unknown",
    positiveTraits: [],
    negativeTraits: [],
  };

  return {
    number: lifePathNumber,
    display: displayLifePathNumber(lifePathNumber),
    ...data,
  };
};


