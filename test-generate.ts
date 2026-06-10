import { generateBlueprint } from './lib/engines/generateBlueprint';

async function run() {
  try {
    const bp = await generateBlueprint({
      uid: "test",
      fullName: "Test User",
      birthDate: "2000-01-01",
      birthTime: "12:00",
      birthCity: "Jakarta"
    });
    console.log(bp);
  } catch (e) {
    console.error(e);
  }
}
run();
