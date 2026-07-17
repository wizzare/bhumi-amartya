export class TimeoutError extends Error {
  constructor(message = "AI request timed out.") {
    super(message);
    this.name = "TimeoutError";
  }
}

export class ProviderError extends Error {
  public code: string;
  constructor(message: string, code = "PROVIDER_ERROR") {
    super(message);
    this.name = "ProviderError";
    this.code = code;
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class LocalFallbackError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LocalFallbackError";
  }
}
