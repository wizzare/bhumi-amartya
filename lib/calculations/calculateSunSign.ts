export default function calculateSunSign(birthDate: string | Date): string {
  const date = typeof birthDate === "string" ? new Date(`${birthDate}T00:00:00`) : birthDate;
  if (isNaN(date.getTime())) return "Unknown";

  const day = date.getDate();
  const month = date.getMonth() + 1;

  // Zodiac date ranges (inclusive start)
  const ranges: { sign: string; start: [number, number] }[] = [
    { sign: "Aquarius", start: [1, 20] },
    { sign: "Pisces", start: [2, 19] },
    { sign: "Aries", start: [3, 21] },
    { sign: "Taurus", start: [4, 20] },
    { sign: "Gemini", start: [5, 21] },
    { sign: "Cancer", start: [6, 21] },
    { sign: "Leo", start: [7, 23] },
    { sign: "Virgo", start: [8, 23] },
    { sign: "Libra", start: [9, 23] },
    { sign: "Scorpio", start: [10, 23] },
    { sign: "Sagittarius", start: [11, 22] },
    { sign: "Capricorn", start: [12, 22] },
  ];

  for (let i = ranges.length - 1; i >= 0; i--) {
    const [mStart, dStart] = ranges[i].start;
    if (month > mStart || (month === mStart && day >= dStart)) {
      return ranges[i].sign;
    }
  }

  // Default to Capricorn for early Jan dates
  return "Capricorn";
}

export { calculateSunSign };
