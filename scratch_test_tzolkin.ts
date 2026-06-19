import { calculateTzolkin } from "./lib/tzolkin/calculateTzolkin";

const result = calculateTzolkin({ birthDate: "1985-05-03" });
console.log(JSON.stringify(result, null, 2));
