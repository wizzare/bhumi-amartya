import * as Astronomy from "astronomy-engine";
import type {
  BaziBlueprint,
  BaziElement,
  BaziInput,
  BaziPillar,
  BaziPolarity,
  ElementBalance,
  LuckPillar,
} from "./types";

const STEMS = [
  { char: "甲", pinyin: "Jia", element: "Wood", polarity: "Yang" },
  { char: "乙", pinyin: "Yi", element: "Wood", polarity: "Yin" },
  { char: "丙", pinyin: "Bing", element: "Fire", polarity: "Yang" },
  { char: "丁", pinyin: "Ding", element: "Fire", polarity: "Yin" },
  { char: "戊", pinyin: "Wu", element: "Earth", polarity: "Yang" },
  { char: "己", pinyin: "Ji", element: "Earth", polarity: "Yin" },
  { char: "庚", pinyin: "Geng", element: "Metal", polarity: "Yang" },
  { char: "辛", pinyin: "Xin", element: "Metal", polarity: "Yin" },
  { char: "壬", pinyin: "Ren", element: "Water", polarity: "Yang" },
  { char: "癸", pinyin: "Gui", element: "Water", polarity: "Yin" },
] as const;

const BRANCHES = [
  { char: "子", pinyin: "Zi", animal: "Rat", element: "Water" },
  { char: "丑", pinyin: "Chou", animal: "Ox", element: "Earth" },
  { char: "寅", pinyin: "Yin", animal: "Tiger", element: "Wood" },
  { char: "卯", pinyin: "Mao", animal: "Rabbit", element: "Wood" },
  { char: "辰", pinyin: "Chen", animal: "Dragon", element: "Earth" },
  { char: "巳", pinyin: "Si", animal: "Snake", element: "Fire" },
  { char: "午", pinyin: "Wu", animal: "Horse", element: "Fire" },
  { char: "未", pinyin: "Wei", animal: "Goat", element: "Earth" },
  { char: "申", pinyin: "Shen", animal: "Monkey", element: "Metal" },
  { char: "酉", pinyin: "You", animal: "Rooster", element: "Metal" },
  { char: "戌", pinyin: "Xu", animal: "Dog", element: "Earth" },
  { char: "亥", pinyin: "Hai", animal: "Pig", element: "Water" },
] as const;

const JIE_LONGITUDES = [315, 345, 15, 45, 75, 105, 135, 165, 195, 225, 255, 285];
const ELEMENTS: BaziElement[] = ["Wood", "Fire", "Earth", "Metal", "Water"];
const GENERATES: Record<BaziElement, BaziElement> = { Wood: "Fire", Fire: "Earth", Earth: "Metal", Metal: "Water", Water: "Wood" };
const CONTROLS: Record<BaziElement, BaziElement> = { Wood: "Earth", Earth: "Water", Water: "Fire", Fire: "Metal", Metal: "Wood" };

const DAY_MASTER_TEXT: Record<string, string> = {
  Jia: "Kayu Yang bertumbuh seperti pohon besar: lurus, visioner, dan berorientasi perkembangan.",
  Yi: "Kayu Yin bertumbuh seperti sulur: adaptif, halus, dan kuat melalui jejaring.",
  Bing: "Api Yang seperti matahari: terbuka, hangat, dan mampu menerangi arah.",
  Ding: "Api Yin seperti pelita: intuitif, teliti, dan memberi pengaruh secara personal.",
  Wu: "Tanah Yang seperti gunung: stabil, protektif, dan kokoh memegang tanggung jawab.",
  Ji: "Tanah Yin seperti lahan subur: merawat, praktis, dan mampu mengolah potensi.",
  Geng: "Logam Yang seperti baja: tegas, berani, dan kuat melakukan pembenahan.",
  Xin: "Logam Yin seperti perhiasan: presisi, bernilai, dan peka terhadap kualitas.",
  Ren: "Air Yang seperti samudra: luas, dinamis, dan kuat menghubungkan banyak arah.",
  Gui: "Air Yin seperti hujan: intuitif, lembut, dan menumbuhkan melalui ketekunan.",
};

function mod(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}

function timezoneOffsetMinutes(timezone?: string | null): number {
  if (!timezone) return 420;
  const match = /^([+-])(\d{2}):?(\d{2})$/.exec(timezone);
  if (match) {
    const minutes = Number(match[2]) * 60 + Number(match[3]);
    return match[1] === "-" ? -minutes : minutes;
  }
  if (timezone === "Asia/Jakarta") return 420;
  return 420;
}

function parseLocalDate(input: BaziInput): { local: Date; utc: Date; year: number; month: number; day: number; hour: number; minute: number } {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input.birthDate);
  const timeMatch = /^(\d{1,2}):(\d{2})/.exec(input.birthTime);
  if (!dateMatch || !timeMatch) throw new Error("BaZi requires birthDate YYYY-MM-DD and birthTime HH:mm.");
  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);
  const localMs = Date.UTC(year, month - 1, day, hour, minute);
  return {
    local: new Date(localMs),
    utc: new Date(localMs - timezoneOffsetMinutes(input.timezone) * 60_000),
    year, month, day, hour, minute,
  };
}

function pillar(stemIndex: number, branchIndex: number): BaziPillar {
  const stem = STEMS[mod(stemIndex, 10)];
  const branch = BRANCHES[mod(branchIndex, 12)];
  return {
    stem: stem.char,
    stemPinyin: stem.pinyin,
    branch: branch.char,
    branchPinyin: branch.pinyin,
    element: stem.element,
    polarity: stem.polarity,
    animal: branch.animal,
    display: `${stem.char}${branch.char} ${stem.pinyin} ${branch.pinyin}`,
  };
}

function searchJie(year: number, monthIndex: number): Date {
  const target = JIE_LONGITUDES[monthIndex];
  const approximateMonth = (monthIndex + 1) % 12;
  const start = new Date(Date.UTC(year, approximateMonth, 1));
  const result = Astronomy.SearchSunLongitude(target, start, 12);
  if (!result) throw new Error(`Unable to calculate solar term ${target}.`);
  return result.date;
}

function baziYearAndMonth(localUtc: Date, civilYear: number): { baziYear: number; monthIndex: number; nextJie: Date } {
  const liChun = searchJie(civilYear, 0);
  const baziYear = localUtc < liChun ? civilYear - 1 : civilYear;
  const boundaries = JIE_LONGITUDES.map((_, index) => searchJie(index === 11 ? baziYear + 1 : baziYear, index));
  let monthIndex = 0;
  let nextJie = boundaries[1];
  for (let index = 0; index < boundaries.length; index += 1) {
    const current = boundaries[index];
    const next = index === 11 ? searchJie(baziYear + 1, 0) : boundaries[index + 1];
    if (localUtc >= current && localUtc < next) {
      monthIndex = index;
      nextJie = next;
      break;
    }
  }
  return { baziYear, monthIndex, nextJie };
}

function julianDayNumber(year: number, month: number, day: number): number {
  let y = year;
  let m = month;
  if (m <= 2) { y -= 1; m += 12; }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524;
}

function tenGod(dayStemIndex: number, otherStemIndex: number): string {
  const day = STEMS[dayStemIndex];
  const other = STEMS[otherStemIndex];
  const samePolarity = day.polarity === other.polarity;
  if (day.element === other.element) return samePolarity ? "Friend" : "Rob Wealth";
  if (GENERATES[day.element] === other.element) return samePolarity ? "Eating God" : "Hurting Officer";
  if (CONTROLS[day.element] === other.element) return samePolarity ? "Indirect Wealth" : "Direct Wealth";
  if (CONTROLS[other.element] === day.element) return samePolarity ? "Seven Killings" : "Direct Officer";
  return samePolarity ? "Indirect Resource" : "Direct Resource";
}

function elementBalance(pillars: BaziPillar[]): ElementBalance {
  const balance: ElementBalance = { Wood: 0, Fire: 0, Earth: 0, Metal: 0, Water: 0 };
  pillars.forEach((item) => {
    balance[item.element] += 1;
    balance[BRANCHES.find((branch) => branch.char === item.branch)!.element] += 1;
  });
  return balance;
}

function createLuckPillars(monthStem: number, monthBranch: number, startAge: number): LuckPillar[] {
  return Array.from({ length: 10 }, (_, index) => ({
    index: index + 1,
    startAge: startAge + index * 10,
    endAge: startAge + index * 10 + 9,
    pillar: pillar(monthStem + index + 1, monthBranch + index + 1),
  }));
}

function calculateAge(birth: Date, reference: Date): number {
  let age = reference.getUTCFullYear() - birth.getUTCFullYear();
  if (
    reference.getUTCMonth() < birth.getUTCMonth() ||
    (reference.getUTCMonth() === birth.getUTCMonth() && reference.getUTCDate() < birth.getUTCDate())
  ) age -= 1;
  return Math.max(0, age);
}

export function calculateBazi(input: BaziInput): BaziBlueprint {
  const parsed = parseLocalDate(input);
  const { baziYear, monthIndex, nextJie } = baziYearAndMonth(parsed.utc, parsed.year);
  const yearCycle = mod(baziYear - 1984, 60);
  const yearPillar = pillar(yearCycle, yearCycle);
  const monthBranchIndex = monthIndex + 2;
  const monthStemIndex = mod((yearCycle % 10) * 2 + 2 + monthIndex, 10);
  const monthPillar = pillar(monthStemIndex, monthBranchIndex);

  const ziDayRollover = parsed.hour >= 23;
  const effectiveMs = Date.UTC(parsed.year, parsed.month - 1, parsed.day + (ziDayRollover ? 1 : 0));
  const effective = new Date(effectiveMs);
  const dayCycle = mod(julianDayNumber(effective.getUTCFullYear(), effective.getUTCMonth() + 1, effective.getUTCDate()) + 48, 60);
  const dayPillar = pillar(dayCycle, dayCycle);
  const hourBranchIndex = mod(Math.floor((parsed.hour + 1) / 2), 12);
  const hourStemIndex = mod((dayCycle % 10) * 2 + hourBranchIndex, 10);
  const hourPillar = pillar(hourStemIndex, hourBranchIndex);
  const pillars = [yearPillar, monthPillar, dayPillar, hourPillar];
  const fiveElements = elementBalance(pillars);
  const dayStemIndex = dayCycle % 10;
  const sorted = [...ELEMENTS].sort((a, b) => fiveElements[a] - fiveElements[b]);
  const favorableElements = sorted.slice(0, 2);
  const unfavorableElements = [...ELEMENTS]
    .filter((element) => !favorableElements.includes(element))
    .sort((a, b) => fiveElements[b] - fiveElements[a])
    .slice(0, 2);
  const startAge = Math.max(1, Math.round((nextJie.getTime() - parsed.utc.getTime()) / 86_400_000 / 3));
  const luckPillars = createLuckPillars(monthStemIndex, monthBranchIndex, startAge);
  const age = calculateAge(parsed.local, input.referenceDate ?? new Date());
  const currentLuckCycle = luckPillars.find((cycle) => age >= cycle.startAge && age <= cycle.endAge) ?? luckPillars[0];
  const dayMasterElement = STEMS[dayStemIndex].element;
  const strengths = [
    DAY_MASTER_TEXT[STEMS[dayStemIndex].pinyin],
    `Elemen ${unfavorableElements[0]} yang dominan memberi kapasitas kuat untuk tema ${unfavorableElements[0].toLowerCase()}.`,
    `Pilar bulan ${monthPillar.display} memperkuat kemampuan membangun fondasi kerja dan tanggung jawab.`,
  ];
  const challenges = [
    `Menjaga ruang bagi elemen ${favorableElements.join(" dan ")} yang relatif lebih sedikit.`,
    `Tidak membiarkan dominasi ${unfavorableElements.join(" dan ")} membuat respons menjadi terlalu satu arah.`,
    "Menyeimbangkan dorongan pribadi dengan ritme relasi dan lingkungan.",
  ];
  const careerStyle = `${STEMS[dayStemIndex].pinyin} ${dayMasterElement} berkembang dalam pekerjaan yang memberi ruang untuk ${dayMasterElement === "Water" ? "strategi, jejaring, riset, dan adaptasi" : dayMasterElement === "Wood" ? "pertumbuhan, pendidikan, desain, dan pengembangan" : dayMasterElement === "Fire" ? "komunikasi, kreativitas, kepemimpinan, dan visibilitas" : dayMasterElement === "Earth" ? "operasional, pengelolaan, pelayanan, dan stabilitas" : "presisi, sistem, kualitas, dan keputusan tegas"}.`;
  const relationshipStyle = `Dalam relasi, Day Master ${STEMS[dayStemIndex].pinyin} membutuhkan komunikasi yang jernih serta pasangan yang menghargai polaritas ${STEMS[dayStemIndex].polarity} dan ritme elemen ${dayMasterElement}.`;
  const moneyStyle = `Pola rezeki berhubungan dengan elemen yang dikendalikan Day Master, yaitu ${CONTROLS[dayMasterElement]}; hasil terbaik datang saat peluang dikelola bersama disiplin, bukan hanya momentum.`;
  const lifeMission = `Misi pertumbuhanmu adalah menyeimbangkan kekuatan ${unfavorableElements.join(" dan ")} dengan kualitas ${favorableElements.join(" dan ")}, sehingga Day Master ${STEMS[dayStemIndex].pinyin} dapat bekerja secara matang dan berkelanjutan.`;
  const summary = [
    `Empat pilarmu adalah ${yearPillar.display}, ${monthPillar.display}, ${dayPillar.display}, dan ${hourPillar.display}. Pilar-pilar ini membentuk delapan karakter dasar yang menggambarkan konteks awal, fondasi, inti diri, dan arah batin.`,
    `Day Master-mu adalah ${STEMS[dayStemIndex].char} ${STEMS[dayStemIndex].pinyin}, ${STEMS[dayStemIndex].polarity} ${dayMasterElement}. ${DAY_MASTER_TEXT[STEMS[dayStemIndex].pinyin]}`,
    `Komposisi Lima Elemen menunjukkan Wood ${fiveElements.Wood}, Fire ${fiveElements.Fire}, Earth ${fiveElements.Earth}, Metal ${fiveElements.Metal}, dan Water ${fiveElements.Water}. Elemen pendukung yang diprioritaskan adalah ${favorableElements.join(" dan ")}, sedangkan ${unfavorableElements.join(" dan ")} perlu dijaga agar tidak berlebihan.`,
    `Siklus keberuntungan saat ini berada pada ${currentLuckCycle.pillar.display}, untuk rentang usia ${currentLuckCycle.startAge}–${currentLuckCycle.endAge}. Urutan Da Yun memakai metode kalender maju karena profil tidak menyimpan gender dan engine tidak mengarang data tersebut.`,
    `${careerStyle} ${relationshipStyle} ${lifeMission}`,
  ];

  return {
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
    dayMaster: {
      stem: STEMS[dayStemIndex].char,
      pinyin: STEMS[dayStemIndex].pinyin,
      element: dayMasterElement,
      polarity: STEMS[dayStemIndex].polarity,
      description: DAY_MASTER_TEXT[STEMS[dayStemIndex].pinyin],
    },
    fiveElements,
    tenGods: [
      { pillar: "year", stem: yearPillar.stem, tenGod: tenGod(dayStemIndex, yearCycle % 10) },
      { pillar: "month", stem: monthPillar.stem, tenGod: tenGod(dayStemIndex, monthStemIndex) },
      { pillar: "hour", stem: hourPillar.stem, tenGod: tenGod(dayStemIndex, hourStemIndex) },
    ],
    favorableElements,
    unfavorableElements,
    luckPillars,
    currentLuckCycle,
    luckCycleMethod: "forward-solar-sequence",
    strengths,
    challenges,
    careerStyle,
    relationshipStyle,
    moneyStyle,
    lifeMission,
    summary,
  };
}
