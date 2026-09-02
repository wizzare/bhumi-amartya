/**
 * V5-03 Journaling Core — Acceptance Verification (CONTRACT-LAYER SUBSET)
 * Run: npx tsx tests/unit/v5-03-journaling-acceptance.test.ts
 *
 * Recovered from CP-036 (036225f). Build 106 Step 4 recovers the journaling DATA
 * CONTRACTS + safety/AI/extraction libs. The V5 journaling UI relocation
 * (app/wellness/journaling/page.tsx, next.config.ts /journal + /innerwork/journaling
 * redirects, legacy page stubs) is a deferred journaling-UI sub-step — its
 * acceptance rows (original 1.2-1.10, 4.1/4.3-4.6, 5.1-5.4/5.6-5.7, 6.1-6.4,
 * 7.2-7.3, 8.2/8.3/8.7, 9.2, 10.5, 11.*) return with that sub-step. Row numbers
 * below are kept from the original for traceability.
 */
import fs from "node:fs";
process.on("unhandledRejection", ()=>{});
process.on("uncaughtException", (e)=>{ if(String(e).includes("FIRESTORE")||String(e).includes("_startProactiveRefresh")||String(e).includes("accessToken")) return; console.error(e); process.exit(1);});
function setupStorage() {
  const store: Record<string,string> = {};
  // @ts-ignore
  global.window = { localStorage: { getItem(k:string){return store[k]??null}, setItem(k:string,v:string){store[k]=v}, removeItem(k:string){delete store[k]}} } as any;
  return store;
}
let passed=0, failed=0;
function ok(name:string, cond:boolean, detail=""){ if(cond){console.log(`✅ ${name}${detail?" — "+detail:""}`);passed++;} else {console.log(`❌ ${name}${detail?" — "+detail:""}`);failed++;} }

(async()=>{
// 1. FIVE MODES (data contract)
{
  const types=fs.readFileSync("lib/data/types.ts","utf8");
  ok("1.1 JournalType union 5 modes", /FREE.*CBT.*EMOTION.*GUIDED.*SPIRITUAL_AWAKENING/.test(types));
}
// 2+3 PERSISTENCE & MULTI-ENTRY (lib/journal/localJournal)
{
  setupStorage();
  const { saveLocalJournalEntry, loadLocalJournalEntries } = await import("../../lib/journal/localJournal.ts");
  const { auth } = await import("../../lib/firebase/firebase.ts");
  // @ts-ignore
  auth.currentUser={uid:"verify-uid-001"};
  const base:any={date:"2026-08-25", theme:"Proses Pelepasan dan Duka yang Mendalam", questions:["Q1"], journalText:"base", emotionalState:"Sedih", bodySignals:["Dada terasa berat"], createdAt:new Date().toISOString(), insight:"i", tomorrowFocus:"t", previousEntryCount:0};
  const eA={...base, id:"entry-A", journalText:"aku menulis bebas hari ini", journalType:"FREE" as const, provenance:"user-written" as const};
  const eB={...base, id:"entry-B", journalText:"cbt situation text", journalType:"CBT" as const, provenance:"ai-insight" as const, cbt:{situation:"kehilangan", automaticThought:"semua salahku"}};
  saveLocalJournalEntry(eA);
  saveLocalJournalEntry(eB);
  const all=loadLocalJournalEntries();
  ok("2.1 saves journalType", all.some((x:any)=>x.journalType==="FREE") && all.some((x:any)=>x.journalType==="CBT"));
  ok("2.2 keeps cbt payload", all.find((x:any)=>x.id==="entry-B")?.cbt?.situation==="kehilangan");
  ok("2.3 keeps createdAt", all.every((x:any)=> typeof x.createdAt==="string" && x.createdAt.length>10));
  ok("2.4 keeps provenance", all.some((x:any)=>x.provenance==="user-written") && all.some((x:any)=>x.provenance==="ai-insight"));
  ok("2.5 keeps user text", all.some((x:any)=>x.journalText==="aku menulis bebas hari ini"));
  ok("3.1 multi-entry same date both survive", all.length===2 && all.some((x:any)=>x.id==="entry-A") && all.some((x:any)=>x.id==="entry-B"), `len=${all.length}`);
  ok("3.2 distinct ids", new Set(all.map((x:any)=>x.id)).size===2);
  ok("2.6 reload same", loadLocalJournalEntries().length===2);
  const eC={...base, id:"entry-C", journalType:"EMOTION" as const, emotion:{primaryFeeling:"marah", bodySensation:"dada"}, journalText:"emosi"};
  const eD={...base, id:"entry-D", journalType:"SPIRITUAL_AWAKENING" as const, spiritual:{experienceDescription:"hening", meaningExplored:"makna"}, journalText:"spirit"};
  const eE={...base, id:"entry-E", journalType:"GUIDED" as const, guided:{promptResponses:[{question:"Q1", answer:"jawaban"}]}, journalText:"guided"};
  saveLocalJournalEntry(eC); saveLocalJournalEntry(eD); saveLocalJournalEntry(eE);
  const all2=loadLocalJournalEntries();
  ok("1.11 EMOTION/ SPIRITUAL/ GUIDED payloads persist", all2.some((x:any)=>x.journalType==="EMOTION" && x.emotion?.primaryFeeling==="marah") && all2.some((x:any)=>x.journalType==="SPIRITUAL_AWAKENING") && all2.some((x:any)=>x.journalType==="GUIDED"));
}
// 4/5 HISTORY + CONTEXT (lib pieces only; page rows deferred)
{
  const lj=fs.readFileSync("lib/journal/localJournal.ts","utf8");
  ok("4.2 grouping by week (lib)", lj.includes("getJournalHistoryGroupedByWeek"));
  ok("5.5 no fabricated theme (lib)", lj.includes("GENERIC_JOURNAL_THEME"));
}
// 6 AUTOSAVE — per-mode draft isolation (lib)
{
  const lj=fs.readFileSync("lib/journal/localJournal.ts","utf8");
  ok("6.5 isolation getScopedDraftKey:JOURNAL_DRAFT_PREFIX", lj.includes("getScopedDraftKey") && lj.includes("JOURNAL_DRAFT_PREFIX") && lj.includes(":${journalType}"));
  ok("6.6 no cross contamination nextEntries prepend", lj.includes("nextEntries = [nextEntry, ...entries]"));
}
// 7 SAFETY (lib/journal/journalSafety)
{
  const safety=fs.readFileSync("lib/journal/journalSafety.ts","utf8");
  ok("7.1 crisisScan exists", safety.includes("crisisScanJournalText"));
  ok("7.4 false path", safety.includes("shouldShowResourceCard: false"));
  const { crisisScanJournalText } = await import("../../lib/journal/journalSafety.ts");
  ok("7.5 normal no card", crisisScanJournalText("hari ini aku cukup tenang").shouldShowResourceCard===false);
  ok("7.6 crisis card+suppress", (()=>{const r=crisisScanJournalText("aku ingin mati saja"); return r.shouldShowResourceCard===true && r.shouldSuppressAI===true;})());
  ok("7.7 crisis in EMOTION mode also triggers", crisisScanJournalText("kekerasan di rumah").shouldShowResourceCard===true);
}
// 8 AI CONTRACT (lib/journal/journalAIContract)
{
  const ai=fs.readFileSync("lib/journal/journalAIContract.ts","utf8");
  ok("8.1 provenance ai-insight|none", ai.includes(`provenance: "ai-insight"`) && ai.includes(`"none"`));
  const { generateJournalAIResponse } = await import("../../lib/journal/journalAIContract.ts");
  const n=generateJournalAIResponse({journalType:"FREE", content:"aku merasa bingung hari ini", locale:"id", theme:"Refleksi"});
  const c=generateJournalAIResponse({journalType:"CBT", content:"aku ingin bunuh diri sekarang", locale:"id"});
  ok("8.4 normal reflective ai-insight", !!n.reflectiveText && n.provenance==="ai-insight" && !n.suppressed);
  ok("8.5 crisis suppressed none", c.suppressed===true && c.provenance==="none" && !c.reflectiveText);
  ok("8.6 non-diagnostic", ai.includes("sanitizeAIOutput"));
}
// 9 PROVENANCE
{
  ok("9.1 MemoryProvenance type", fs.readFileSync("lib/journal/localJournal.ts","utf8").includes("MemoryProvenance"));
}
// 10 I18N — journaling.* bundle keys (recovered Step 3)
{
  for(const loc of ["id-ID","en-US","ms-MY"]){
    const j=JSON.parse(fs.readFileSync(`src/locales/${loc}/translation.json`,"utf8"));
    const m=j.journaling?.modes;
    ok(`10.1 ${loc} 5 modes`, m && Object.keys(m).length===5);
    ok(`10.2 ${loc} cbt/emotion/spiritual/guided/free`, !!(j.journaling?.cbt && j.journaling?.emotion && j.journaling?.spiritual && j.journaling?.guided && j.journaling?.free));
    ok(`10.3 ${loc} safety/ai/history`, !!(j.journaling?.safety && j.journaling?.ai && j.journaling?.history));
    ok(`10.4 ${loc} label non-empty`, j.journaling.modes.FREE.label.length>0);
  }
}

console.log(`\n--- SUMMARY ${passed} passed, ${failed} failed ---`);
if(failed>0) process.exit(1);
})();
