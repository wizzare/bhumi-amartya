import { semesterTiming, localDateParts } from "../lib/arsipAkashi/profile/timing";

const checks: Array<[string, boolean]> = [];
const check = (name: string, pass: boolean) => checks.push([name, pass]);
check("Jakarta 2026-12-31", localDateParts("2026-12-31T16:00:00Z", "Asia/Jakarta").year === 2026);
check("Jakarta 2027-01-01", localDateParts("2026-12-31T17:00:00Z", "Asia/Jakarta").year === 2027);
check("June semester 1 current", semesterTiming("2026-06-30T12:00:00Z", "Asia/Jakarta", 1).semesterStatus === "current");
check("July semester 2 current", semesterTiming("2026-07-01T12:00:00Z", "Asia/Jakarta", 2).semesterStatus === "current");
check("February semester 1 current", semesterTiming("2026-02-01T00:00:00Z", "Asia/Jakarta", 1).semesterStatus === "current");
check("February semester 2 upcoming", semesterTiming("2026-02-01T00:00:00Z", "Asia/Jakarta", 2).semesterStatus === "upcoming");
check("August semester 1 past", semesterTiming("2026-08-01T00:00:00Z", "Asia/Jakarta", 1).semesterStatus === "past");
check("August semester 2 current", semesterTiming("2026-08-01T00:00:00Z", "Asia/Jakarta", 2).semesterStatus === "current");
check("year-neutral IDs", semesterTiming("2027-01-01T00:00:00Z", "Asia/Jakarta", 1).semesterId === "current-life-semester-1");
const failures = checks.filter(([, pass]) => !pass);
if (failures.length) { console.error(failures.map(([name]) => name).join("\n")); process.exit(1); }
console.log(`Dynamic timing validation passed: ${checks.length} checks.`);
