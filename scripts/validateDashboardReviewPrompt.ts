import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");
const dashboard = read("components/dashboard/DashboardClient.tsx");
const prompt = read("components/rating/DashboardReviewPrompt.tsx");
const dialog = read("components/rating/ReviewDialog.tsx");
const service = read("lib/rating/reviewTriggerService.ts");
const settings = read("app/settings/page.tsx");
const fail = (message: string): never => { throw new Error(`[REVIEW_VALIDATION] ${message}`); };

if ((dashboard.match(/<DashboardReviewPrompt/g) ?? []).length !== 1) fail("expected one DashboardReviewPrompt mount");
if ((dashboard.match(/DashboardReviewPrompt/g) ?? []).length < 2) fail("canonical prompt import/mount missing");
if (/ReviewTrigger|requestReview\(\)/.test(read("app/login/page.tsx") + read("app/layout.tsx"))) fail("duplicate login/root trigger detected");
if (!prompt.includes('pathname !== "/dashboard"') || !prompt.includes("dashboardReady") || !prompt.includes("blockedByModal")) fail("dashboard readiness gate incomplete");
if (!service.includes("MIN_INSTALL_DAYS: 3") || !service.includes("MIN_SESSIONS: 3")) fail("eligibility thresholds missing");
if (!service.includes("guardianRole === 'founder'") || !service.includes("guardianRole === 'admin'")) fail("admin exclusion missing");
if (!service.includes("OPT_OUT") || !service.includes("PROMPT_COOLDOWN_DAYS")) fail("cooldown or opt-out persistence missing");
if (!dialog.includes("Nanti Saja") || !dialog.includes("Jangan Tampilkan Lagi") || /five-star|lima bintang|5\s*star/i.test(dialog)) fail("non-coercive actions missing");
if (settings.includes("Beri Rating")) fail("Settings rating entry still present");
if (!service.includes("play.google.com/store/apps/details?id=com.bhumiamartya.app")) fail("Play Store fallback missing");
if (!service.includes("ACTION_REQUESTED_AT")) fail("review action tracking missing");
if (fs.existsSync(path.join(root, "components/rating/ReviewTrigger.tsx"))) fail("legacy duplicate trigger remains");

console.log("DASHBOARD_REVIEW_PROMPT_VALIDATION_PASS");
