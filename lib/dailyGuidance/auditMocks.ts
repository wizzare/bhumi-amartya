export function getMockProfile(user: string) {
  return {
    uid: `${user}_uid`,
    fullName: user.charAt(0).toUpperCase() + user.slice(1),
    language: "id",
    setupCompleted: true,
    birthDate: "1990-01-01",
    birthCity: "Jakarta"
  };
}

export function getMockBlueprint(user: string) {
  return {
    uid: `${user}_uid`,
    status: "ready",
    lifePath: { number: 7, role: "The Seeker" },
    humanDesign: { type: "Projector", profile: "5/1" },
    destinyMatrix: { center: 17 },
    astrology: { sunSign: "Capricorn" }
  };
}
