type HumanDesignHubResponse = Record<string, unknown>;

type HumanDesignBodygraphResult = {
  type: string | null;
  status: "ready" | "pending" | "error";
  source: "human-design-hub";
  note?: string;
};

const HUMAN_DESIGN_HUB_URL = "https://api.humandesignhub.app/v1/bodygraph";
const DEFAULT_TIMEZONE = "+07:00";

const isObject = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
};

const readString = (value: unknown): string | null => {
  return typeof value === "string" && value.trim() ? value.trim() : null;
};

const readType = (data: HumanDesignHubResponse): string | null => {
  const payload = isObject(data.data) ? data.data : data;
  const candidates = [
    payload.type,
    payload.energyType,
    isObject(payload.chart) ? payload.chart.type : null,
    isObject(payload.bodygraph) ? payload.bodygraph.type : null,
    isObject(payload.properties) ? payload.properties.type : null,
  ];

  const type = candidates.map(readString).find(Boolean);

  return type ?? null;
};

const pendingResult = (note: string): HumanDesignBodygraphResult => ({
  type: null,
  status: "pending",
  source: "human-design-hub",
  note,
});

export async function POST(request: Request) {
  try {
    const apiKey = process.env.HUMAN_DESIGN_HUB_API_KEY;

    if (!apiKey) {
      return Response.json(
        {
          type: null,
          status: "error",
          source: "human-design-hub",
          note: "HUMAN_DESIGN_HUB_API_KEY is not configured.",
        } satisfies HumanDesignBodygraphResult,
        { status: 500 },
      );
    }

    const body = await request.json().catch(() => null);
    if (!isObject(body)) {
      return Response.json(
        {
          type: null,
          status: "error",
          source: "human-design-hub",
          note: "Invalid JSON body.",
        } satisfies HumanDesignBodygraphResult,
        { status: 400 },
      );
    }
    const birthDate = typeof body.birthDate === "string" ? body.birthDate : "";
    const birthTime = typeof body.birthTime === "string" ? body.birthTime : "";
    const timezone =
      typeof body.timezone === "string" && body.timezone.trim()
        ? body.timezone.trim()
        : DEFAULT_TIMEZONE;

    if (!birthDate || !birthTime) {
      return Response.json(
        {
          type: null,
          status: "error",
          source: "human-design-hub",
          note: "birthDate and birthTime are required.",
        } satisfies HumanDesignBodygraphResult,
        { status: 400 },
      );
    }

    const datetime = `${birthDate}T${birthTime}:00${timezone}`;
    const response = await fetch(HUMAN_DESIGN_HUB_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify({
        datetime,
        verbose: true,
      }),
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);
    const raw = isObject(data) ? data : undefined;

    if (!response.ok) {
      return Response.json(
        {
          type: null,
          status: "error",
          source: "human-design-hub",
          note: `Human Design Hub API returned ${response.status}.`,
        } satisfies HumanDesignBodygraphResult,
        { status: response.status },
      );
    }

    if (!raw) {
      return Response.json(pendingResult("Human Design type was not found in API response."));
    }

    const type = readType(raw);

    if (!type) {
      return Response.json(pendingResult("Human Design type was not found in API response."));
    }

    return Response.json({
      type,
      status: "ready",
      source: "human-design-hub",
    } satisfies HumanDesignBodygraphResult);
  } catch (error) {
    console.error("[Human Design Hub] Bodygraph request failed:", error);

    return Response.json(
      {
        type: null,
        status: "error",
        source: "human-design-hub",
        note: "Human Design API unavailable.",
      } satisfies HumanDesignBodygraphResult,
      { status: 500 },
    );
  }
}
