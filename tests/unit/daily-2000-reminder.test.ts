import assert from "node:assert";
import {
  getNextNightReminderAt,
  GENTLE_NIGHT_REMINDER_ID,
  REENGAGEMENT_3D_ID,
  REENGAGEMENT_7D_ID,
} from "../../lib/notifications/gentleNightReminder";
import { notificationCopy } from "../../lib/notifications/notificationPolicy";
import fs from "node:fs";

console.log("-> Testing Daily Reminder 20:00 schedule and configuration");

// 1. Target time test: when before 20:00, schedule for today at 20:00
const morning = new Date("2026-10-24T10:00:00");
const nextFromMorning = getNextNightReminderAt(morning);
assert.equal(nextFromMorning.getHours(), 20, "Should schedule for hour 20");
assert.equal(nextFromMorning.getMinutes(), 0, "Should schedule for minute 0");
assert.equal(nextFromMorning.getSeconds(), 0, "Should schedule for second 0");
assert.equal(nextFromMorning.getDate(), morning.getDate(), "Should schedule on same day if morning");

// 2. Target time test: when after 20:00, schedule for tomorrow at 20:00
const night = new Date("2026-10-24T21:30:00");
const nextFromNight = getNextNightReminderAt(night);
assert.equal(nextFromNight.getHours(), 20, "Should schedule for hour 20");
assert.equal(nextFromNight.getMinutes(), 0, "Should schedule for minute 0");
assert.equal(nextFromNight.getDate(), night.getDate() + 1, "Should schedule on next day if already past 20:00");

// 3. Exact 20:00 boundary condition
const exactlyEight = new Date("2026-10-24T20:00:00");
const nextFromEight = getNextNightReminderAt(exactlyEight);
assert.equal(nextFromEight.getHours(), 20, "Should schedule for hour 20");
assert.equal(nextFromEight.getDate(), exactlyEight.getDate() + 1, "At 20:00:00, should schedule for tomorrow");

// 4. Stable notification IDs (prevent duplicates)
assert.equal(GENTLE_NIGHT_REMINDER_ID, 2100, "Daily reminder ID must remain stable 2100");
assert.equal(REENGAGEMENT_3D_ID, 2101, "3D reengagement ID must remain stable 2101");
assert.equal(REENGAGEMENT_7D_ID, 2102, "7D reengagement ID must remain stable 2102");

// 5. Indonesian copy and tone check
const copyId = notificationCopy("daily", "id-ID");
assert.ok(copyId.title.length > 0, "Indonesian notification title must not be empty");
assert.ok(copyId.body.length > 0, "Indonesian notification body must not be empty");
assert.ok(!copyId.body.includes("Sudah 3 hari") && !copyId.body.includes("Bhumi kangen"), "Copy must contain no guilt-trip phrasing");

// 6. Settings UI string check
const settingsPage = fs.readFileSync("app/settings/page.tsx", "utf8");
assert.ok(settingsPage.includes("Setiap hari · 20.00"), "Settings page must display 'Setiap hari · 20.00'");
assert.ok(!settingsPage.includes("21.00 waktu perangkat"), "Old 21.00 copy must be removed from Settings");

console.log("PASS daily-2000-reminder (10 assertions)");
