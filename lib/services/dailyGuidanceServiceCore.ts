export interface DailyGuidanceIdentity {
  uid: string;
  date: string;
}

export interface DailyGuidanceServiceRequest {
  uid: string;
  date: string;
  versionKey: string;
}

export interface DailyGuidanceServiceDependencies<T extends DailyGuidanceIdentity> {
  repository: {
    get(uid: string, date: string): Promise<T | null>;
    save(value: T): Promise<void>;
  };
  generate(request: DailyGuidanceServiceRequest): Promise<T>;
  fallback(request: DailyGuidanceServiceRequest, error: unknown): T;
  isValid(value: unknown, request: DailyGuidanceServiceRequest): value is T;
}

export interface DailyGuidanceServiceResponse<T> {
  guidance: T;
  source: "cache" | "repository" | "generated" | "fallback";
}

export function createDailyGuidanceServiceCore<T extends DailyGuidanceIdentity>(
  dependencies: DailyGuidanceServiceDependencies<T>,
) {
  const cache = new Map<string, T>();
  const inFlight = new Map<string, Promise<DailyGuidanceServiceResponse<T>>>();

  const keyFor = (request: DailyGuidanceServiceRequest) =>
    `${request.uid}:${request.date}:${request.versionKey}`;

  async function execute(
    request: DailyGuidanceServiceRequest,
  ): Promise<DailyGuidanceServiceResponse<T>> {
    const key = keyFor(request);
    const cached = cache.get(key);
    if (cached && dependencies.isValid(cached, request)) {
      return { guidance: cached, source: "cache" };
    }
    cache.delete(key);

    const active = inFlight.get(key);
    if (active) return active;

    const operation = (async () => {
      const existing = await dependencies.repository.get(request.uid, request.date);
      if (existing && dependencies.isValid(existing, request)) {
        cache.set(key, existing);
        return { guidance: existing, source: "repository" as const };
      }

      let guidance: T;
      let source: "generated" | "fallback" = "generated";
      try {
        guidance = await dependencies.generate(request);
      } catch (error) {
        guidance = dependencies.fallback(request, error);
        source = "fallback";
      }

      if (!dependencies.isValid(guidance, request)) {
        throw new Error("INVALID_DAILY_GUIDANCE_RESULT");
      }

      await dependencies.repository.save(guidance);
      cache.set(key, guidance);
      return { guidance, source };
    })().finally(() => {
      inFlight.delete(key);
    });

    inFlight.set(key, operation);
    return operation;
  }

  return {
    execute,
    clearCache(): void {
      cache.clear();
    },
  };
}
