const axios = require('axios');

const PYTHON_URL = "http://localhost:8000/calculate";

const SAMPLE_BIRTH_DATES = [
    { name: "Widya Amalia", date: "1987-06-09", time: "09:00", tz: "+07:00", old_type: "Projector" },
    { name: "Trisia", date: "2002-09-17", time: "02:00", tz: "+08:00", old_type: "Reflector" },
    { name: "Sample 3", date: "1995-03-12", time: "15:30", tz: "+07:00", old_type: "Generator" },
    { name: "Sample 4", date: "1980-11-22", time: "11:11", tz: "+07:00", old_type: "Manifestor" },
    { name: "Sample 5", date: "1990-01-01", time: "00:01", tz: "+07:00", old_type: "Projector" },
    { name: "Sample 6", date: "2005-05-05", time: "12:00", tz: "+08:00", old_type: "Generator" },
    { name: "Sample 7", date: "1985-08-08", time: "18:00", tz: "+07:00", old_type: "Projector" },
    { name: "Sample 8", date: "1975-04-04", time: "04:00", tz: "+07:00", old_type: "Manifesting Generator" },
];

async function runSimulation() {
    console.log("=== HUMAN DESIGN IMPACT SAMPLING (SIMULATION) ===");
    console.log("Comparing JS Engine logic results vs Python Engine for statistical impact estimation.");

    const stats = {
        total: SAMPLE_BIRTH_DATES.length,
        changes: 0,
        typeChanges: [],
        noChange: 0
    };

    for (const s of SAMPLE_BIRTH_DATES) {
        try {
            const payload = {
                name: s.name,
                year: parseInt(s.date.split("-")[0]),
                month: parseInt(s.date.split("-")[1]),
                day: parseInt(s.date.split("-")[2]),
                hour: parseInt(s.time.split(":")[0]),
                minute: parseInt(s.time.split(":")[1]),
                second: 0,
                utc_offset: s.tz === "+08:00" ? 8 : 7
            };

            const res = await axios.post(PYTHON_URL, payload);
            const py = res.data.general;

            if (s.old_type !== py.energy_type) {
                stats.changes++;
                stats.typeChanges.push(`${s.name}: ${s.old_type} -> ${py.energy_type}`);
            } else {
                stats.noChange++;
            }
        } catch (e) {
            console.error(`Error for ${s.name}: ${e.message}`);
        }
    }

    console.log("\nTOTAL SAMPLES:", stats.total);
    console.log("TYPE CHANGES FOUND:");
    stats.typeChanges.forEach(c => console.log(`- ${c}`));

    console.log("\nSUMMARY:");
    console.log(`- Probability of Mass Change: ${((stats.changes / stats.total) * 100).toFixed(1)}%`);
    console.log("\nCONCLUSION:");
    if (stats.changes > stats.total / 4) {
        console.log("RESULT: MASS IMPACT CONFIRMED (Recalculation will affect a significant portion of users).");
    } else {
        console.log("RESULT: EDGE CASE (Changes are rare).");
    }
}

runSimulation();
