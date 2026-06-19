import { calculateTzolkin } from "./lib/tzolkin/calculateTzolkin";

function findDateForKin(targetKin: number): string {
  let d = new Date("1987-07-26T12:00:00Z"); // Kin 34
  for (let i = 0; i < 2000; i++) {
    const dateStr = d.toISOString().split("T")[0];
    const tzolkin = calculateTzolkin({ birthDate: dateStr });
    if (tzolkin.kin === targetKin) {
      return dateStr;
    }
    d.setDate(d.getDate() + 1);
  }
  return "";
}

const targets = [1, 52, 104, 156, 208, 260];

console.log("--- VALIDATION RESULTS ---");
for (const target of targets) {
  const dateStr = findDateForKin(target);
  const tzolkin = calculateTzolkin({ birthDate: dateStr });
  console.log(`\nTARGET: Kin ${target}`);
  console.log(`Date Used: ${dateStr}`);
  console.log(`Kin: ${tzolkin.kin}`);
  console.log(`Name: ${tzolkin.kinName}`);
  console.log(`Seal: ${tzolkin.solarSeal.name}`);
  console.log(`Tone: ${tzolkin.galacticTone.name}`);
  console.log(`Wavespell: ${tzolkin.wavespell.name}`);
  console.log(`Castle: ${tzolkin.castle.name}`);
  console.log(`GAP: ${tzolkin.gap}`);
}
