import type { EmotionalMemory, HealingActionRecord } from "../data/types";

export function recordHealingAction(
  currentMemory: EmotionalMemory,
  action: Omit<HealingActionRecord, "completedAt">,
): EmotionalMemory {
  const completedAt = new Date().toISOString();
  const actionRecord: HealingActionRecord = {
    ...action,
    completedAt,
  };

  const updated: EmotionalMemory = {
    ...currentMemory,
    healingActions: [...currentMemory.healingActions, actionRecord],
  };

  updated.suggestedFocus = generateSuggestedFocus(updated);
  updated.nextHealingEdge = generateNextHealingEdge(updated);

  return updated;
}

function generateSuggestedFocus(memory: EmotionalMemory): string {
  if (memory.healingActions.length === 0) {
    return "Begin with a grounding practice that honors your nervous system.";
  }

  if (memory.healingActions.length === 1) {
    return "Lean into the practice that felt most soothing and notice what shifts.";
  }

  if (memory.healingActions.length >= 3) {
    return "Now is a time to deepen with curiosity, not force. Bring attention to the tender places in your body.";
  }

  return "Continue with the next gentle practice in your healing day.";
}

function generateNextHealingEdge(memory: EmotionalMemory): string {
  if (memory.recurringWounds.some((w) => w.intensity === "deep" && w.healingProgress === "no-progress")) {
    const deepWound = memory.recurringWounds.find((w) => w.intensity === "deep");
    return `The next edge is to meet ${deepWound?.wound} with curiosity rather than avoidance.`;
  }

  if (memory.healingActions.length >= 3) {
    return "The next edge is tender embodiment: keep doing the small things that feel true.";
  }

  return "The next edge is to witness how your body responds when you slow down.";
}
