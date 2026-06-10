export function getLocalDateKey(date = new Date(), timeZone?: string): string {
  if (timeZone) {
    try {
      const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      return formatter.format(date);
    } catch (e) {
      console.warn(`[DATE_KEY] Invalid timezone: ${timeZone}, falling back to local.`);
    }
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
