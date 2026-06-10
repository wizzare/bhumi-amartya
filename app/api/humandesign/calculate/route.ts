type HumanDesignCalculateResult = {
  type: string | null;
  profile: string | null;
  authority: string | null;
  strategy: string | null;
  notSelfTheme: string | null;
  signature: string | null;
  definedCenters: string[];
  openCenters: string[];
  gatesPersonality: string[];
  gatesDesign: string[];
  status: "ready" | "pending" | "error";
  source: "human-design-py";
  note?: string;
};

const DEFAULT_OFFSET_MINUTES = 420;
const PYTHON_CALCULATE_URL = "http://localhost:8000/calculate";

const readString = (value: unknown): string | null => {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
};

const readStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
};

const normalizeTimezoneToUtcOffset = (timezone: unknown): number => {
  if (typeof timezone === "number" && Number.isFinite(timezone)) {
    if (Math.abs(timezone) > 14) {
      return timezone / 60;
    }
    return timezone;
  }

  if (typeof timezone === "string") {
    const value = timezone.trim();
    if (!value) {
      return DEFAULT_OFFSET_MINUTES / 60;
    }

    if (/^[+-]?\d+$/.test(value)) {
      const numeric = Number(value);
      if (Math.abs(numeric) > 14) {
        return numeric / 60;
      }
      return numeric;
    }

    const match = value.match(/^([+-])(\d{1,2})(?::?(\d{2}))?$/);
    if (match) {
      const sign = match[1] === "-" ? -1 : 1;
      const hours = Number(match[2]);
      const minutes = Number(match[3] ?? "0");
      const totalMinutes = sign * (hours * 60 + minutes);
      return totalMinutes / 60;
    }
  }

  return DEFAULT_OFFSET_MINUTES / 60;
};

const parseBirthDate = (birthDate: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
    return null;
  }
  const [yearRaw, monthRaw, dayRaw] = birthDate.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    year < 1900 ||
    year > 2100 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }
  return { year, month, day };
};

const parseBirthTime = (birthTime: string) => {
  if (!/^\d{2}:\d{2}(:\d{2})?$/.test(birthTime)) {
    return null;
  }
  const [hourRaw, minuteRaw, secondRaw] = birthTime.split(":");
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);
  const second = Number(secondRaw ?? "0");
  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    !Number.isInteger(second) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59 ||
    second < 0 ||
    second > 59
  ) {
    return null;
  }
  return { hour, minute, second };
};

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return Response.json(
        {
          type: null,
          profile: null,
          authority: null,
          strategy: null,
          notSelfTheme: null,
          signature: null,
          definedCenters: [],
          openCenters: [],
          gatesPersonality: [],
          gatesDesign: [],
          status: "error",
          source: "human-design-py",
          note: "Invalid JSON body.",
        } satisfies HumanDesignCalculateResult,
        { status: 400 },
      );
    }
    const bodyRecord = body as Record<string, unknown>;
    const fullName = readString(bodyRecord.fullName) ?? "Unknown";
    const birthDate = readString(bodyRecord.birthDate) ?? "";
    const birthTime = readString(bodyRecord.birthTime) ?? "";

    if (!birthDate || !birthTime) {
      return Response.json(
        {
          type: null,
          profile: null,
          authority: null,
          strategy: null,
          notSelfTheme: null,
          signature: null,
          definedCenters: [],
          openCenters: [],
          gatesPersonality: [],
          gatesDesign: [],
          status: "error",
          source: "human-design-py",
          note: "birthDate and birthTime are required.",
        } satisfies HumanDesignCalculateResult,
        { status: 400 },
      );
    }

    const parsedBirthDate = parseBirthDate(birthDate);
    const parsedBirthTime = parseBirthTime(birthTime);
    if (!parsedBirthDate || !parsedBirthTime) {
      return Response.json(
        {
          type: null,
          profile: null,
          authority: null,
          strategy: null,
          notSelfTheme: null,
          signature: null,
          definedCenters: [],
          openCenters: [],
          gatesPersonality: [],
          gatesDesign: [],
          status: "error",
          source: "human-design-py",
          note: "birthDate or birthTime format is invalid.",
        } satisfies HumanDesignCalculateResult,
        { status: 400 },
      );
    }
    const { year, month, day } = parsedBirthDate;
    const { hour, minute, second } = parsedBirthTime;
    const utc_offset = normalizeTimezoneToUtcOffset(bodyRecord.timezone);

    const response = await fetch(PYTHON_CALCULATE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: fullName,
        year,
        month,
        day,
        hour,
        minute,
        second,
        utc_offset,
      }),
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));
    const dataObj = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
    const general =
      dataObj.general && typeof dataObj.general === "object"
        ? (dataObj.general as Record<string, unknown>)
        : {};
    const centers =
      dataObj.centers && typeof dataObj.centers === "object"
        ? (dataObj.centers as Record<string, unknown>)
        : {};
    const gates = dataObj.gates && typeof dataObj.gates === "object" ? (dataObj.gates as Record<string, unknown>) : {};

    const gatesPersonalityObj =
      gates.personality && typeof gates.personality === "object"
        ? (gates.personality as Record<string, unknown>)
        : {};
    const gatesDesignObj =
      gates.design && typeof gates.design === "object" ? (gates.design as Record<string, unknown>) : {};

    const result: HumanDesignCalculateResult = {
      type: readString(dataObj.type) ?? readString(general.energy_type),
      profile: readString(dataObj.profile) ?? readString(general.profile),
      authority: readString(dataObj.authority) ?? readString(general.inner_authority),
      strategy: readString(dataObj.strategy) ?? readString(general.strategy),
      notSelfTheme: readString(dataObj.notSelfTheme) ?? readString(general.not_self),
      signature: readString(dataObj.signature) ?? readString(general.signature),
      definedCenters: readStringArray(dataObj.definedCenters).length
        ? readStringArray(dataObj.definedCenters)
        : readStringArray(centers.defined),
      openCenters: readStringArray(dataObj.openCenters).length
        ? readStringArray(dataObj.openCenters)
        : readStringArray(centers.undefined),
      gatesPersonality: readStringArray(dataObj.gatesPersonality).length
        ? readStringArray(dataObj.gatesPersonality)
        : Object.keys(gatesPersonalityObj),
      gatesDesign: readStringArray(dataObj.gatesDesign).length
        ? readStringArray(dataObj.gatesDesign)
        : Object.keys(gatesDesignObj),
      status: readString(dataObj.status) === "error" ? "error" : "pending",
      source: "human-design-py",
    };

    if (result.type) {
      result.status = "ready";
    } else if (!response.ok) {
      result.status = "error";
      result.note = `Human Design service returned ${response.status}.`;
    } else {
      result.status = "pending";
      result.note = "Human Design type is not available yet.";
    }

    return Response.json(result, { status: response.ok ? 200 : response.status });
  } catch (error) {
    return Response.json(
      {
        type: null,
        profile: null,
        authority: null,
        strategy: null,
        notSelfTheme: null,
        signature: null,
        definedCenters: [],
        openCenters: [],
        gatesPersonality: [],
        gatesDesign: [],
        status: "pending",
        source: "human-design-py",
        note: "Human Design service is not running.",
      } satisfies HumanDesignCalculateResult,
      { status: 200 },
    );
  }
}
