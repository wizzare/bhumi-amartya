export const FIRST_USER_EMAIL = "wizzare@gmail.com";

export const firstUserProfileSeed = {
  fullName: "Widhi Wedhaswara",
  birthDate: "1985-05-03",
  birthTime: "23:45",
  birthPlace: "Jakarta",
  birthCountry: "Indonesia",
  latitude: -6.2088,
  longitude: 106.8456,
  timezone: "Asia/Jakarta",
  language: "id" as const,
};

export function isFirstUserEmail(email?: string | null) {
  return email === FIRST_USER_EMAIL;
}
