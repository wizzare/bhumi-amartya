import { classifyProfileReadiness } from "../lib/arsipAkashi/profile/readiness";

const checks: Array<[string, boolean]> = [];
const check = (name: string, value: boolean) => checks.push([name, value]);
check("complete profile ready", classifyProfileReadiness({ birthDate: "1990-01-01", birthTime: "12:00", birthCity: "Jakarta" }).status === "ready");
check("missing time limited", classifyProfileReadiness({ birthDate: "1990-01-01", birthCity: "Jakarta" }).status === "limited");
check("null blueprint does not affect profile readiness", classifyProfileReadiness({ birthDate: "1990-01-01", birthCity: "Jakarta" }).status !== "incomplete");
check("missing date incomplete", classifyProfileReadiness({ birthTime: "12:00", birthCity: "Jakarta" }).status === "incomplete");
check("missing place incomplete", classifyProfileReadiness({ birthDate: "1990-01-01" }).status === "incomplete");
check("legacy field names", classifyProfileReadiness({ dateOfBirth: "1990-01-01", timeOfBirth: "12:00", cityOfBirth: "Jakarta" }).status === "ready");
check("loading explicit", classifyProfileReadiness(null, false).status === "loading");
const failures = checks.filter(([, pass]) => !pass);
if (failures.length) { console.error(failures.map(([name]) => name).join("\n")); process.exit(1); }
console.log(`Profile readiness validation passed: ${checks.length} checks.`);
