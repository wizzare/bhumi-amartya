import { calculateAdvancedVariables } from "../lib/humandesign/calculateAdvancedVariables";

async function run() {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  const baseUrl = "https://bhumi-humandesign-api-production.up.railway.app/calculate";
  const url = `${baseUrl}?date=1994-06-18&time=07:30&timezone=Asia/Jakarta&debug=true`;
  const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "User",
        birthDate: "1994-06-18",
        birthTime: "07:30",
        birthPlace: "Jakarta",
        timezone: "Asia/Jakarta",
        debug: true,
      })
  });
  const raw = await response.json();
  
  const pSun = raw.diagnostic?.raw_personality_gates?.find((g: any) => g.planet === "Sun");
  const dSun = raw.diagnostic?.raw_design_gates?.find((g: any) => g.planet === "Sun");
  const pNode = raw.diagnostic?.raw_personality_gates?.find((g: any) => g.planet === "North_Node");
  const dNode = raw.diagnostic?.raw_design_gates?.find((g: any) => g.planet === "North_Node");

  console.log("=== RAW DATA ===");
  console.log("Personality Sun (Motivation):", pSun);
  console.log("Design Sun (Digestion/Cognition):", dSun);
  console.log("Personality Node (Perspective):", pNode);
  console.log("Design Node (Environment):", dNode);
  
  console.log("\n=== CALCULATED ===");
  const mapped = calculateAdvancedVariables(raw.diagnostic as any);
  console.log(JSON.stringify(mapped, null, 2));
}

run().catch(console.error);
