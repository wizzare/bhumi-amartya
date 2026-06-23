type DateParts = {
  year: number;
  month: number;
  day: number;
};

export type DestinyMatrixEnergyResult = {
  base: Record<"apoint" | "bpoint" | "cpoint", number>;
  points: Record<string, number>;
  purposes: Record<string, number>;
  chartHeart: Record<string, number>;
  years: Record<string, number>;
};

const assertInteger = (value: number, name: string) => {
  if (!Number.isInteger(value)) {
    throw new Error(`${name} must be an integer`);
  }
};

const isLeapYear = (year: number) => {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};

const daysInMonth = (year: number, month: number) => {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  if ([4, 6, 9, 11].includes(month)) return 30;
  return 31;
};

const validateDate = (year: number, month: number, day: number) => {
  assertInteger(year, "year");
  assertInteger(month, "month");
  assertInteger(day, "day");

  if (year < 1 || year > 9999) {
    throw new Error("year must be between 1 and 9999");
  }

  if (month < 1 || month > 12) {
    throw new Error("month must be between 1 and 12");
  }

  const maxDay = daysInMonth(year, month);
  if (day < 1 || day > maxDay) {
    throw new Error(`day must be between 1 and ${maxDay} for the given month/year`);
  }
};

export function reduceNumber(n: number) {
  assertInteger(n, "n");
  if (n < 0) {
    throw new Error("n must be a non-negative integer");
  }

  if (n > 22) {
    return (n % 10) + Math.floor(n / 10);
  }

  return n;
}

export function calculateYear(year: number) {
  assertInteger(year, "year");
  if (year < 0) {
    throw new Error("year must be a non-negative integer");
  }

  let y = 0;
  let tmp = year;
  while (tmp > 0) {
    y += tmp % 10;
    tmp = Math.floor(tmp / 10);
  }

  return reduceNumber(y);
}

export function parseIsoDate(value: string): DateParts {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    throw new Error("date must be in YYYY-MM-DD format");
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

export function baseFromYmd(year: number, month: number, day: number) {
  validateDate(year, month, day);

  return {
    apoint: reduceNumber(day),
    bpoint: month,
    cpoint: calculateYear(year),
  };
}

const sum7 = (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => {
  return a + b + c + d + e + f + g;
};

export function calculateFromBase(apoint: number, bpoint: number, cpoint: number): DestinyMatrixEnergyResult {
  assertInteger(apoint, "apoint");
  assertInteger(bpoint, "bpoint");
  assertInteger(cpoint, "cpoint");

  const r = reduceNumber;

  const dpoint = r(apoint + bpoint + cpoint);
  const epoint = r(apoint + bpoint + cpoint + dpoint);
  const fpoint = r(apoint + bpoint);
  const gpoint = r(bpoint + cpoint);
  const hpoint = r(dpoint + apoint);
  const ipoint = r(cpoint + dpoint);
  const jpoint = r(dpoint + epoint);

  const npoint = r(cpoint + epoint);
  const lpoint = r(jpoint + npoint);
  const mpoint = r(lpoint + npoint);
  const kpoint = r(jpoint + lpoint);

  const qpoint = r(npoint + cpoint);
  const rpoint = r(jpoint + dpoint);
  const spoint = r(apoint + epoint);
  const tpoint = r(bpoint + epoint);

  const opoint = r(apoint + spoint);
  const ppoint = r(bpoint + tpoint);

  const upoint = r(fpoint + gpoint + hpoint + ipoint);
  const vpoint = r(epoint + upoint);
  const wpoint = r(spoint + epoint);
  const xpoint = r(tpoint + epoint);

  const f2point = r(fpoint + epoint);
  const f1point = r(fpoint + f2point);
  const g2point = r(gpoint + epoint);
  const g1point = r(gpoint + g2point);
  const i2point = r(ipoint + epoint);
  const i1point = r(ipoint + i2point);
  const h2point = r(hpoint + epoint);
  const h1point = r(hpoint + h2point);

  const afpoint = r(apoint + fpoint);
  const af1point = r(apoint + afpoint);
  const af2point = r(apoint + af1point);
  const af3point = r(afpoint + af1point);
  const af4point = r(afpoint + fpoint);
  const af5point = r(afpoint + af4point);
  const af6point = r(af4point + fpoint);
  const fbpoint = r(fpoint + bpoint);
  const fb1point = r(fpoint + fbpoint);
  const fb2point = r(fpoint + fb1point);
  const fb3point = r(fbpoint + fb1point);
  const fb4point = r(fbpoint + bpoint);
  const fb5point = r(fbpoint + fb4point);
  const fb6point = r(fb4point + bpoint);
  const bgpoint = r(bpoint + gpoint);
  const bg1point = r(bpoint + bgpoint);
  const bg2point = r(bpoint + bg1point);
  const bg3point = r(bgpoint + bg1point);
  const bg4point = r(bgpoint + gpoint);
  const bg5point = r(bgpoint + bg4point);
  const bg6point = r(bg4point + gpoint);
  const gcpoint = r(gpoint + cpoint);
  const gc1point = r(gpoint + gcpoint);
  const gc2point = r(gpoint + gc1point);
  const gc3point = r(gcpoint + gc1point);
  const gc4point = r(gcpoint + cpoint);
  const gc5point = r(gcpoint + gc4point);
  const gc6point = r(gc4point + cpoint);
  const cipoint = r(cpoint + ipoint);
  const ci1point = r(cpoint + cipoint);
  const ci2point = r(cpoint + ci1point);
  const ci3point = r(cipoint + ci1point);
  const ci4point = r(cipoint + ipoint);
  const ci5point = r(cipoint + ci4point);
  const ci6point = r(ci4point + ipoint);
  const idpoint = r(ipoint + dpoint);
  const id1point = r(ipoint + idpoint);
  const id2point = r(ipoint + id1point);
  const id3point = r(idpoint + id1point);
  const id4point = r(idpoint + dpoint);
  const id5point = r(idpoint + id4point);
  const id6point = r(id4point + dpoint);
  const dhpoint = r(dpoint + hpoint);
  const dh1point = r(dpoint + dhpoint);
  const dh2point = r(dpoint + dh1point);
  const dh3point = r(dhpoint + dh1point);
  const dh4point = r(dhpoint + hpoint);
  const dh5point = r(dhpoint + dh4point);
  const dh6point = r(dh4point + hpoint);
  const hapoint = r(hpoint + apoint);
  const ha1point = r(hpoint + hapoint);
  const ha2point = r(hpoint + ha1point);
  const ha3point = r(hapoint + ha1point);
  const ha4point = r(hapoint + apoint);
  const ha5point = r(hapoint + ha4point);
  const ha6point = r(ha4point + apoint);

  const skypoint = r(bpoint + dpoint);
  const earthpoint = r(apoint + cpoint);
  const perspurpose = r(skypoint + earthpoint);
  const femalepoint = r(gpoint + hpoint);
  const malepoint = r(fpoint + ipoint);
  const socialpurpose = r(femalepoint + malepoint);
  const generalpurpose = r(perspurpose + socialpurpose);
  const planetarypurpose = r(socialpurpose + generalpurpose);

  const points = {
    apoint, bpoint, cpoint, dpoint, epoint, fpoint, gpoint, hpoint, ipoint, jpoint,
    kpoint, lpoint, mpoint, npoint, opoint, ppoint, qpoint, rpoint, spoint, tpoint,
    upoint, vpoint, wpoint, xpoint, f2point, f1point, g2point, g1point, i2point,
    i1point, h2point, h1point,
  };

  const years = {
    afpoint, af1point, af2point, af3point, af4point, af5point, af6point,
    fbpoint, fb1point, fb2point, fb3point, fb4point, fb5point, fb6point,
    bgpoint, bg1point, bg2point, bg3point, bg4point, bg5point, bg6point,
    gcpoint, gc1point, gc2point, gc3point, gc4point, gc5point, gc6point,
    cipoint, ci1point, ci2point, ci3point, ci4point, ci5point, ci6point,
    idpoint, id1point, id2point, id3point, id4point, id5point, id6point,
    dhpoint, dh1point, dh2point, dh3point, dh4point, dh5point, dh6point,
    hapoint, ha1point, ha2point, ha3point, ha4point, ha5point, ha6point,
  };

  const purposes = {
    skypoint,
    earthpoint,
    perspurpose,
    femalepoint,
    malepoint,
    socialpurpose,
    generalpurpose,
    planetarypurpose,
  };

  const chartHeart: Record<string, number> = {
    sahphysics: apoint,
    ajphysics: opoint,
    vishphysics: spoint,
    anahphysics: wpoint,
    manphysics: epoint,
    svadphysics: jpoint,
    mulphysics: cpoint,
    sahenergy: bpoint,
    ajenergy: ppoint,
    vishenergy: tpoint,
    anahenergy: xpoint,
    manenergy: epoint,
    svadenergy: npoint,
    mulenergy: dpoint,
    sahemotions: r(apoint + bpoint),
    ajemotions: r(opoint + ppoint),
    vishemotions: r(spoint + tpoint),
    anahemotions: r(wpoint + xpoint),
    manemotions: r(epoint + epoint),
    svademotions: r(jpoint + npoint),
    mulemotions: r(cpoint + dpoint),
  };

  chartHeart.resultphysics = r(sum7(
    chartHeart.sahphysics,
    chartHeart.ajphysics,
    chartHeart.vishphysics,
    chartHeart.anahphysics,
    chartHeart.manphysics,
    chartHeart.svadphysics,
    chartHeart.mulphysics,
  ));
  chartHeart.resultenergy = r(sum7(
    chartHeart.sahenergy,
    chartHeart.ajenergy,
    chartHeart.vishenergy,
    chartHeart.anahenergy,
    chartHeart.manenergy,
    chartHeart.svadenergy,
    chartHeart.mulenergy,
  ));
  chartHeart.resultemotions = r(sum7(
    chartHeart.sahemotions,
    chartHeart.ajemotions,
    chartHeart.vishemotions,
    chartHeart.anahemotions,
    chartHeart.manemotions,
    chartHeart.svademotions,
    chartHeart.mulemotions,
  ));

  return {
    base: { apoint, bpoint, cpoint },
    points,
    purposes,
    chartHeart,
    years,
  };
}

export function calculateDestinyMatrixEnergy(input: string | DateParts): DestinyMatrixEnergyResult {
  const date = typeof input === "string" ? parseIsoDate(input) : input;
  const base = baseFromYmd(date.year, date.month, date.day);
  return calculateFromBase(base.apoint, base.bpoint, base.cpoint);
}
