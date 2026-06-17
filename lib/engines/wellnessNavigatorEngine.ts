import { WellnessMapping, WellnessCategory } from "./wellnessMappingEngine";
import { NavigatorAction, NAVIGATOR_ACTIONS, NavigatorMode } from "../data/navigatorActionLibrary";

export interface NavigatorState {
  mode: NavigatorMode;
  primaryAction: NavigatorAction;
  supportingActions: NavigatorAction[];
  generatedAt: string;
}

export function getNavigatorMode(topTheme: WellnessCategory, bodyScore: number): NavigatorMode {
  // RULE 4: Priority Order - Theme Safety / Energy Constraint
  if (bodyScore < 30) return "RECOVERY";

  switch (topTheme) {
    case "BURNOUT" :
    case "ANXIETY":
    case "LIFE_CRISIS":
    case "LOSS_AND_GRIEF":
      return "RECOVERY";

    case "MEANING_CRISIS":
    case "LIFE_TRANSITION":
    case "SPIRITUAL_CRISIS":
      return "REFLECTION";

    case "GROWTH_PHASE":
    case "SPIRITUAL_AWAKENING":
      return "GROWTH";

    default:
      return "REFLECTION";
  }
}

export function calculateNavigatorState(mapping: WellnessMapping): NavigatorState {
  const topTheme = mapping.results[0]?.category || "GROWTH_PHASE";
  const bodyScore = mapping.drivers.dimensions.body || 50;

  const mode = getNavigatorMode(topTheme, bodyScore);

  // Filter actions by mode
  const availableActions = NAVIGATOR_ACTIONS.filter(a => a.mode === mode);

  // 1. Identify Primary Action based on lowest dimension within the mode
  const dimensionOrder = Object.entries(mapping.drivers.dimensions)
    .sort((a, b) => a[1] - b[1])
    .map(d => d[0].toUpperCase());

  let primary: NavigatorAction | undefined;

  for (const dim of dimensionOrder) {
    primary = availableActions.find(a => a.targetDimension === dim);
    if (primary) break;
  }

  if (!primary) primary = availableActions[0];

  // 2. Identify Supporting Actions (different from primary)
  const supporting = availableActions
    .filter(a => a.id !== primary?.id)
    .sort(() => 0.5 - Math.random())
    .slice(0, 2);

  return {
    mode,
    primaryAction: primary,
    supportingActions: supporting,
    generatedAt: new Date().toISOString()
  };
}

export type WellnessNavigatorState = NavigatorState;

export const wellnessNavigatorEngine = {
  calculateNavigator: calculateNavigatorState,
};
