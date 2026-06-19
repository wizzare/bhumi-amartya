import { HD_ENGINE_VERSION } from "../../../../lib/humandesign/hdAudit";

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
  incarnationCross: string | null;
  inc_cross: string | null;
  channels: string[];
  diagnostic?: {
    raw_personality_gates: RawActivation[];
    raw_design_gates: RawActivation[];
  };
  personalityActivations?: RawActivation[];
  designActivations?: RawActivation[];
  definition: string | number | null;
  status: "ready" | "pending" | "error" | "service_unavailable";
  source: "human-design-py";
  hdEngineVersion?: string;
  calculationStatus?: "completed" | "pending" | "error" | "service_unavailable" | "timeout" | "connection_error";
  calculationQuality?: "verified" | "service_unavailable" | "timeout" | "connection_error" | "unavailable";
  note?: string;
  variables?: any;
  digestion?: string | null;
  environment?: string | null;
  motivation?: string | null;
  cognition?: string | null;
};

type RawActivation = {
  planet: string;
  gate: number;
  line: number;
  color?: number;
  tone?: number;
  base?: number;
};

const DEFAULT_OFFSET_MINUTES = 420;
const HD_SERVICE_TIMEOUT_MS = 7000;
const HD_SERVICE_BASE_URL =
  process.env.HUMAN_DESIGN_SERVICE_URL?.replace(/\/$/, "") ||
  "http://localhost:8000";
const PYTHON_CALCULATE_URL = `${HD_SERVICE_BASE_URL}/calculate`;

const readString = (value: unknown): string | null => {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
};

const readStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
};

const readFiniteNumber = (value: unknown): number | undefined => {
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
};

const readActivations = (value: unknown): RawActivation[] => {
  const entries = Array.isArray(value)
    ? value.map((item, index) => [String((item as any)?.planet || index), item] as const)
    : value && typeof value === "object"
      ? Object.entries(value as Record<string, unknown>)
      : [];

  return entries.flatMap(([key, raw]) => {
    if (!raw || typeof raw !== "object") return [];
    const item = raw as Record<string, unknown>;
    const gate = readFiniteNumber(item.gate ?? item.g ?? key);
    const line = readFiniteNumber(item.line ?? item.l);
    if (gate === undefined || line === undefined) return [];
    return [{
      planet: readString(item.planet) || readString(item.name) || key,
      gate,
      line,
      color: readFiniteNumber(item.color),
      tone: readFiniteNumber(item.tone),
      base: readFiniteNumber(item.base),
    }];
  });
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

const serviceUnavailableResult = (
  reason: "service_unavailable" | "timeout" | "connection_error",
  note: string,
): HumanDesignCalculateResult => ({
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
  incarnationCross: null,
  inc_cross: null,
  channels: [],
  definition: null,
  status: "service_unavailable",
  source: "human-design-py",
  hdEngineVersion: HD_ENGINE_VERSION,
  calculationStatus: reason,
  calculationQuality: reason,
  note,
});

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
          incarnationCross: null,
          inc_cross: null,
          channels: [],
          definition: null,
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
          incarnationCross: null,
          inc_cross: null,
          channels: [],
          definition: null,
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
          incarnationCross: null,
          inc_cross: null,
          channels: [],
          definition: null,
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

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), HD_SERVICE_TIMEOUT_MS);
    let response: Response;

    try {
      response = await fetch(PYTHON_CALCULATE_URL, {
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
          debug: true,
        }),
        cache: "no-store",
        signal: controller.signal,
      });
    } catch (error) {
      const reason = error instanceof DOMException && error.name === "AbortError" ? "timeout" : "connection_error";
      return Response.json(
        serviceUnavailableResult(
          reason,
          reason === "timeout"
            ? "Human Design service request timed out."
            : "Human Design service is not reachable.",
        ),
        { status: 503 },
      );
    } finally {
      clearTimeout(timeout);
    }

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
    const incarnationCross = readString(dataObj.incarnationCross) ?? readString(dataObj.inc_cross);
    const rawDefinition = dataObj.definition ?? general.definition;
    const definition =
      typeof rawDefinition === "number" && Number.isFinite(rawDefinition)
        ? rawDefinition
        : readString(rawDefinition);

    const variables = dataObj.variables && typeof dataObj.variables === "object" ? (dataObj.variables as any) : null;
    const upstreamDiagnostic =
      dataObj.diagnostic && typeof dataObj.diagnostic === "object"
        ? dataObj.diagnostic as Record<string, unknown>
        : {};
    const rawPersonalityGates = readActivations(
      upstreamDiagnostic.raw_personality_gates ?? dataObj.raw_personality_gates ?? gates.personality,
    );
    const rawDesignGates = readActivations(
      upstreamDiagnostic.raw_design_gates ?? dataObj.raw_design_gates ?? gates.design,
    );
    let digestion: string | null = null;
    let environment: string | null = null;
    let motivation: string | null = null;
    let cognition: string | null = null;

    if (variables) {
      digestion = variables.top_left?.def_type || null;
      environment = variables.bottom_left?.def_type || null;
      motivation = variables.top_right?.def_type || null;

      const tone = variables.top_left?.tone;
      if (typeof tone === "number") {
        const cognitions: Record<number, string> = {
          1: "Smell",
          2: "Taste",
          3: "Outer Vision",
          4: "Inner Vision",
          5: "Feeling",
          6: "Touch"
        };
        cognition = cognitions[tone] || null;
      }
    }

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
      incarnationCross,
      inc_cross: incarnationCross,
      channels: readStringArray(dataObj.channels),
      diagnostic: {
        raw_personality_gates: rawPersonalityGates,
        raw_design_gates: rawDesignGates,
      },
      personalityActivations: rawPersonalityGates,
      designActivations: rawDesignGates,
      definition,
      variables,
      digestion,
      environment,
      motivation,
      cognition,
      status: readString(dataObj.status) === "error" ? "error" : "pending",
      source: "human-design-py",
      hdEngineVersion: HD_ENGINE_VERSION,
      calculationStatus: "pending",
      calculationQuality: "unavailable",
    };

    if (result.type) {
      result.status = "ready";
      result.calculationStatus = "completed";
      result.calculationQuality = "verified";
    } else if (!response.ok) {
      result.status = "error";
      result.calculationStatus = "error";
      result.note = `Human Design service returned ${response.status}.`;
    } else {
      result.status = "pending";
      result.calculationStatus = "pending";
      result.calculationQuality = "unavailable";
      result.note = "Human Design type is not available yet.";
    }

    return Response.json(result, { status: response.ok ? 200 : response.status });
  } catch (error) {
    return Response.json(
      serviceUnavailableResult("service_unavailable", "Human Design service is not reachable."),
      { status: 503 },
    );
  }
}
