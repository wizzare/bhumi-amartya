export type SemesterStatus = "past" | "current" | "upcoming";

export function localDateParts(referenceDate: string, timezone: string): { year: number; month: number; day: number } {
  const date = new Date(referenceDate);
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timezone || "UTC", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const value = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  return { year: value("year"), month: value("month"), day: value("day") };
}

export function semesterTiming(referenceDate: string, timezone: string, semester: 1 | 2) {
  const local = localDateParts(referenceDate, timezone);
  const currentSemester = local.month <= 6 ? 1 : 2;
  return { activeYear: local.year, semesterId: `current-life-semester-${semester}`, periodStart: `${local.year}-${semester === 1 ? "01-01" : "07-01"}`, periodEnd: `${local.year}-${semester === 1 ? "06-30" : "12-31"}`, semesterStatus: semester < currentSemester ? "past" as const : semester > currentSemester ? "upcoming" as const : "current" as const, userTimezone: timezone };
}
