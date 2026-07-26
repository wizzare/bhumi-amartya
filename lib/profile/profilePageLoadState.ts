export type ProfilePageDailyNoteState = "loading" | "ready" | "unavailable";

export function resolveProfilePageLoadState(input: {
  hasProfile: boolean;
  hasBlueprint: boolean;
  guidanceReady: boolean;
}): { loading: false; dailyNoteState: Exclude<ProfilePageDailyNoteState, "loading"> } {
  return {
    loading: false,
    dailyNoteState: input.hasProfile && input.hasBlueprint && input.guidanceReady
      ? "ready"
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
