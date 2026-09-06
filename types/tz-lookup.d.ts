declare module "tz-lookup" {
  /**
   * Deterministic offline lat/lon -> IANA timezone name (e.g. "Asia/Jakarta").
   * Pure-JS polygon lookup, no I/O, no network. May throw on out-of-range input.
   */
  export default function tzlookup(latitude: number, longitude: number): string;
}
