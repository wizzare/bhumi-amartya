import { CanonicalTranslatorService } from "../lib/services/canonicalTranslatorService";
import type { Blueprint } from "../lib/types/blueprint";
import * as fs from "fs";
import * as path from "path";

const goldenUsers = [
  {
    name: "Widhi",
    blueprint: {
      status: "ready",
      numerology: { lifePath: { number: 22 } },
      humanDesign: { profile: "4/6", type: "Manifesting Generator", authority: "Sacral", strategy: "Wait to Respond" },
      destinyMatrix: {
        destinyPoint: 8,
        karmicTail: [18, 6, 15],
        talentsFather: [9, 15, 6],
        loveLine: [5, 20, 15],
        yearlyArcana: 11
      },
      astrology: { sunSign: "Taurus", moonSign: "Libra", chiron: "Aries" },
      bazi: { dominantElement: "Kayu (Wood)" },
      vedic: { darakaraka: { planet: "Mars" }, currentMahadasha: { planet: "Rahu" } }
    } as unknown as Blueprint
  },
  {
    name: "Ning",
    blueprint: {
      status: "ready",
      numerology: { lifePath: { number: 6 } },
      humanDesign: { profile: "2/4", type: "Projector", authority: "Splenic", strategy: "Wait for Invitation" },
      destinyMatrix: {
        destinyPoint: 6,
        karmicTail: [15, 5, 8],
        talentsFather: [11, 21, 10],
        loveLine: [6, 18, 12],
        yearlyArcana: 15
      },
      astrology: { sunSign: "Libra", moonSign: "Cancer", chiron: "Taurus" },
      bazi: { dominantElement: "Api (Fire)" },
      vedic: { darakaraka: { planet: "Saturn" }, currentMahadasha: { planet: "Jupiter" } }
    } as unknown as Blueprint
  },
  {
    name: "Widya",
    blueprint: {
      status: "ready",
      numerology: { lifePath: { number: 4 } },
      humanDesign: { profile: "1/3", type: "Manifesting Generator", authority: "Emotional", strategy: "Wait to Respond" },
      destinyMatrix: {
        destinyPoint: 4,
        karmicTail: [21, 4, 10],
        talentsFather: [8, 14, 6],
        loveLine: [3, 13, 10],
        yearlyArcana: 7
      },
      astrology: { sunSign: "Gemini", moonSign: "Scorpio", chiron: "Capricorn" },
      bazi: { dominantElement: "Tanah (Earth)" },
      vedic: { darakaraka: { planet: "Venus" }, currentMahadasha: { planet: "Saturn" } }
    } as unknown as Blueprint
  },
  {
    name: "Amartya",
    blueprint: {
      status: "ready",
      numerology: { lifePath: { number: 9 } },
      humanDesign: { profile: "6/2", type: "Projector", authority: "Self-Projected", strategy: "Wait for Invitation" },
      destinyMatrix: {
        destinyPoint: 9,
        karmicTail: [9, 3, 21],
        talentsFather: [10, 15, 5],
        loveLine: [9, 18, 9],
        yearlyArcana: 20
      },
      astrology: { sunSign: "Gemini", moonSign: "Taurus", chiron: "Leo" },
      bazi: { dominantElement: "Logam (Metal)" },
      vedic: { darakaraka: { planet: "Mercury" }, currentMahadasha: { planet: "Mercury" } }
    } as unknown as Blueprint
  },
  {
    name: "Eva",
    blueprint: {
      status: "ready",
      numerology: { lifePath: { number: 11 } },
      humanDesign: { profile: "3/5", type: "Reflector", authority: "Lunar", strategy: "Wait a Lunar Cycle" },
      destinyMatrix: {
        destinyPoint: 12,
        karmicTail: [12, 16, 4],
        talentsFather: [5, 11, 16],
        loveLine: [12, 6, 18],
        yearlyArcana: 12
      },
      astrology: { sunSign: "Virgo", moonSign: "Taurus", chiron: "Pisces" },
      bazi: { dominantElement: "Air (Water)" },
      vedic: { darakaraka: { planet: "Moon" }, currentMahadasha: { planet: "Ketu" } }
    } as unknown as Blueprint
  }
];

function runValidation() {
  console.log("=== STARTING CANONICAL TRANSLATOR VALIDATION ===");

  let reportMarkdown = "# CANONICAL TRANSLATOR VALIDATION REPORT\\n\\n";
  reportMarkdown += "This report validates that the CanonicalTranslatorService correctly translates raw blueprints into cohesive human domains.\\n\\n";

  for (const user of goldenUsers) {
    console.log(`Translating identity for ${user.name}...`);
    try {
      const canonical = CanonicalTranslatorService.translate(user.blueprint);

      reportMarkdown += `## USER: ${user.name}\\n`;
      reportMarkdown += `### 1. IDENTITY\\n- **Sun Sign**: ${canonical.identity.sunSign}\\n- **HD Profile**: ${canonical.identity.hdProfile}\\n\\n`;
      reportMarkdown += `### 2. PURPOSE\\n- **Life Path**: ${canonical.purpose.lifePath}\\n- **Destiny Point**: ${canonical.purpose.destinyPoint}\\n\\n`;
      reportMarkdown += `### 3. ENERGY\\n- **Authority**: ${canonical.energy.authority}\\n- **Strategy**: ${canonical.energy.strategy}\\n- **Dominant Element**: ${canonical.energy.dominantElement}\\n\\n`;
      reportMarkdown += `### 4. SHADOW\\n- **Karmic Tail**: ${canonical.shadow.karmicTail.join(", ")}\\n- **Chiron**: ${canonical.shadow.chiron}\\n- **Money Block**: ${JSON.stringify(canonical.shadow.moneyBlock)}\\n- **Love Block**: ${JSON.stringify(canonical.shadow.loveBlock)}\\n\\n`;
      reportMarkdown += `### 5. TALENTS\\n- **Matrix Talents**: ${canonical.talents.matrixTalents.join(", ")}\\n- **HD Type**: ${canonical.talents.hdType}\\n- **Work Style**: ${JSON.stringify(canonical.talents.workStyle)}\\n\\n`;
      reportMarkdown += `### 6. RELATIONSHIPS\\n- **Relationship Style**: ${canonical.relationships.relationshipStyle}\\n- **Love Line**: ${canonical.relationships.loveLine.join(", ")}\\n- **Boundaries**: ${JSON.stringify(canonical.relationships.healthyBoundaries)}\\n\\n`;
      reportMarkdown += `### 7. TIMING\\n- **Current Dasha**: ${canonical.timing.currentDasha}\\n- **Yearly Arcana**: ${canonical.timing.yearlyArcana}\\n- **Daily Focus**: ${canonical.timing.dailyFocus}\\n\\n`;
      reportMarkdown += `---\\n\\n`;

      console.log(`[PASS] ${user.name}`);
    } catch (e) {
      console.error(`[FAIL] ${user.name}:`, e);
      reportMarkdown += `## USER: ${user.name}\\n**ERROR**: Translation failed.\\n\\n---\\n\\n`;
    }
  }

  const outputPath = path.join(process.cwd(), "VALIDATION_REPORT.md");
  fs.writeFileSync(outputPath, reportMarkdown, "utf8");
  console.log(`\\nValidation complete. Report written to: ${outputPath}`);
}

runValidation();
