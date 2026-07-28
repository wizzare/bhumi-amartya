export type ProfilePageDailyNoteState = "loading" | "ready" | "unavailable" | "error";
export type ProfileDailyGuidanceSource = "existing" | "local" | "unavailable" | "error";

export function resolveProfilePageLoadState(input: {
  hasProfile: boolean;
  hasBlueprint: boolean;
  arsipAvailable: boolean;
  normalizedReadingsLength: number;
  guidanceSource: ProfileDailyGuidanceSource;
}): { loading: false; dailyNoteState: Exclude<ProfilePageDailyNoteState, "loading"> } {
  if (!input.hasProfile || !input.hasBlueprint || !input.arsipAvailable || input.normalizedReadingsLength === 0) {
    return { loading: false, dailyNoteState: "unavailable" };
  }

  return {
    loading: false,
    dailyNoteState: input.guidanceSource === "existing" || input.guidanceSource === "local"
      ? "ready"
      : input.guidanceSource === "error"
        ? "error"
        : "unavailable",
  };
}

export function isCurrentProfilePageLoad(
  loadId: number,
  activeLoadId: number,
  cancelled: boolean,
): boolean {
  return !cancelled && loadId === activeLoadId;
}
