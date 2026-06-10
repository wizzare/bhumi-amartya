export type LaunchStatusValue = "draft" | "internal_testing" | "ready_20_users" | "paused";

export type SoftLaunchChecklistItem = {
  id: string;
  label: string;
  checked: boolean;
  note: string;
};

export type KnownBug = {
  title: string;
  severity: "low" | "medium" | "high" | "blocker";
  status: "open" | "fixed";
  createdAt: string;
};

export type LaunchStatusRecord = {
  status: LaunchStatusValue;
  updatedAt: string;
};

export type LaunchReadinessInput = {
  checklist: SoftLaunchChecklistItem[];
  knownBugs: KnownBug[];
  launchStatus: LaunchStatusRecord;
};

export type LaunchReadinessOutput = {
  checklistCompletion: number;
  blockerCount: number;
  openBugCount: number;
  missingRequiredItems: string[];
  decision: "Belum siap soft launch" | "Masih perlu QA" | "Siap untuk soft launch terbatas";
  reasons: string[];
};

const REQUIRED_CHECKLIST_ITEMS = new Set<string>([
  "Setup works",
  "Google Auth works",
  "Dashboard works",
  "Human Design works",
  "Journal works",
  "Meditation works",
  "Audio Healing works",
  "Journey works",
  "Insight works",
  "Weekly Report works",
  "Billing works",
  "Push Notification works",
  "Security checklist complete",
  "Mobile layout checked",
]);

const CHECKLIST_THRESHOLD = 80;

export function calculateLaunchReadiness(input: LaunchReadinessInput): LaunchReadinessOutput {
  const { checklist, knownBugs } = input;
  const checklistCompletion = checklist.length === 0
    ? 0
    : Math.round((checklist.filter((item) => item.checked).length / checklist.length) * 100);

  const blockerCount = knownBugs.filter((bug) => bug.status === "open" && bug.severity === "blocker").length;
  const openBugCount = knownBugs.filter((bug) => bug.status === "open").length;
  const missingRequiredItems = checklist
    .filter((item) => REQUIRED_CHECKLIST_ITEMS.has(item.label) && !item.checked)
    .map((item) => item.label);

  let decision: LaunchReadinessOutput["decision"];
  const reasons: string[] = [];

  if (blockerCount > 0) {
    decision = "Belum siap soft launch";
    reasons.push(`Open blocker bugs: ${blockerCount}`);
    reasons.push("Fix blocker bugs before launch.");
  } else if (checklistCompletion < CHECKLIST_THRESHOLD) {
    decision = "Masih perlu QA";
    reasons.push(`Checklist completion: ${checklistCompletion}% / required ${CHECKLIST_THRESHOLD}%`);
    reasons.push(`Open blocker bugs: ${blockerCount}`);
    reasons.push(`Open bugs: ${openBugCount}`);
    if (missingRequiredItems.length > 0) {
      reasons.push("Required unchecked items:");
    }
  } else {
    decision = "Siap untuk soft launch terbatas";
    reasons.push(`Checklist completion: ${checklistCompletion}% / required ${CHECKLIST_THRESHOLD}%`);
    reasons.push(`Open blocker bugs: ${blockerCount}`);
  }

  return {
    checklistCompletion,
    blockerCount,
    openBugCount,
    missingRequiredItems,
    decision,
    reasons,
  };
}
