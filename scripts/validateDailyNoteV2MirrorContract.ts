import { readFileSync } from "node:fs";
import { buildMirrorDailyConclusionContract, getCanonicalDailyConclusion } from "../lib/dailyGuidance/dailyConclusionContract";
import { createDailyShareCardContent } from "../lib/profile/dailyShareCardEngine";
import { buildDaily, check, report } from "./validateDailyNoteV2Helpers";

const checks: { name: string; pass: boolean; detail: string }[] = [];
const guidance = buildDaily("moana007");
const contract = buildMirrorDailyConclusionContract(guidance);
const dailyConclusion = getCanonicalDailyConclusion(guidance);
const shareSource = readFileSync("lib/profile/dailyShareCardEngine.ts", "utf8");
const share = createDailyShareCardContent({
  profileSections: [],
  dateKey: guidance.localDateKey ?? guidance.date,
  userSeed: guidance.uid,
  guidance,
});

check(checks, "canonical dailyConclusion getter returns same object", dailyConclusion === guidance.dailyConclusion, "getter does not return guidance dailyConclusion");
check(checks, "Mirror contract uses same dailyConclusion", contract?.dailyConclusion === guidance.dailyConclusion, "mirror contract not using same object");
check(checks, "Mirror contract keeps local date", contract?.localDateKey === guidance.dailyConclusion?.localDateKey, "date mismatch");
check(checks, "Mirror contract keeps timezone", contract?.timezone === guidance.dailyConclusion?.timezone, "timezone mismatch");
check(checks, "share-card reads dailyConclusion", shareSource.includes("dailyConclusion?.text"), "share-card does not read dailyConclusion");
check(checks, "share-card uses concise conclusion source", share.soulMessage.summary.includes(guidance.dailyConclusion?.text.slice(0, 24) ?? "never"), "share content not sourced from conclusion");

report("validateDailyNoteV2MirrorContract", checks);
