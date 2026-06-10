import { calculateLifePath } from "../lib/calculations/calculateLifePath";
import calculateSunSign from "../lib/calculations/calculateSunSign";
import {
  birthDateTimeToUtcDate,
  calculateHumanDesignTypeFromBirthData,
} from "../lib/humandesign/calculateHumanDesignType";

const cases = [
  {
    name: "Bangil beta tester",
    birthDate: "1987-06-09",
    birthTime: "09:00",
    timezone: "+07:00",
    longitude: 112.78,
  },
  {
    name: "Selong zodiac check",
    birthDate: "2006-12-26",
    birthTime: "06:00",
    timezone: "+08:00",
    longitude: 116.53,
  },
  {
    name: "Jakarta LP check",
    birthDate: "1985-05-03",
    birthTime: "23:45",
    timezone: "+07:00",
    longitude: 106.85,
  },
];

for (const item of cases) {
  const lifePath = calculateLifePath(item.birthDate);
  const utc = birthDateTimeToUtcDate(
    item.birthDate,
    item.birthTime,
    item.timezone,
    item.longitude,
  );
  const hdFallbackType = calculateHumanDesignTypeFromBirthData(
    item.birthDate,
    item.birthTime,
    item.timezone,
    item.longitude,
  );

  console.log(JSON.stringify({
    name: item.name,
    lifePath: lifePath.display ?? String(lifePath.number),
    lifePathNumber: lifePath.number,
    lifePathRole: lifePath.role,
    sunSign: calculateSunSign(item.birthDate),
    utc: utc.toISOString(),
    hdFallbackType,
    hdAccuracy: "approximate",
  }));
}
