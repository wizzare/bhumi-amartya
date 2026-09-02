/**
 * V5-05 Daily Context — 5-source priority
 * User Input > Wellness > Confirmed Memory > Astro > Env
 */
import assert from "node:assert";
import { buildDailyContext } from "../../lib/dailyContext/buildDailyContext.ts";

function ok(n:string,c:boolean){ if(!c){ console.error(`❌ ${n}`); process.exit(1);} console.log(`✅ ${n}`); }

const wellnessSnap:any = { healthCondition:"normal", lifeSituation:["rel_grief_close"], metrics:{sleep:5,energy:5,emotion:5,focus:5,social:5}};
const wellness={ snapshot: wellnessSnap, dailyState: null as any };
const mem:any[]=[];

// User overrides wellness
{
  const ctx=buildDailyContext({ date:"2026-08-25", userInput:{emotionalWord:"cemas", checkInCompleted:true}, wellness, confirmedMemory: [{ theme:"pelepasan", label:"Proses pelepasan muncul dalam 4 catatan", confidence:0.8, state:"CONFIRMED", originatingModes:["FREE"], evidence:[] } as any], astro:null, environment:null });
  ok("user overrides wellness+memory", ctx.resolved.source==="user_input" && ctx.resolved.theme==="cemas");
  ok("memory not applied when user present", !ctx.resolved.theme?.includes("pelepasan"));
}

// Wellness overrides memory
{
  const ctx=buildDailyContext({ date:"2026-08-25", userInput:{checkInCompleted:false}, wellness, confirmedMemory: [{ theme:"pelepasan", label:"Proses pelepasan muncul", confidence:0.8, state:"CONFIRMED", originatingModes:["FREE"], evidence:[] } as any], astro:null, environment:null });
  ok("wellness overrides memory", ctx.resolved.source==="wellness");
}

// Memory overrides astro/env when higher available
{
  const ctx=buildDailyContext({ date:"2026-08-25", userInput:{}, wellness:{snapshot:null,dailyState:null}, confirmedMemory: [{ theme:"pelepasan", label:"Proses pelepasan muncul", confidence:0.8, state:"CONFIRMED", originatingModes:["FREE"], evidence:[] } as any], astro:{ summary:"Moon" } as any, environment:{ weather:{condition:"Hujan"}} as any });
  ok("memory overrides astro/env", ctx.resolved.source==="memory" && ctx.resolved.theme?.includes("pelepasan"));
}

// Astro used when no higher
{
  const ctx=buildDailyContext({ date:"2026-08-25", userInput:{}, wellness:{snapshot:null,dailyState:null}, confirmedMemory: [], astro:{ summary:"gerhana"} as any, environment:null });
  ok("astro when no higher", ctx.resolved.source==="astro");
}

// Env used last
{
  const ctx=buildDailyContext({ date:"2026-08-25", userInput:{}, wellness:{snapshot:null,dailyState:null}, confirmedMemory: [], astro:null, environment:{ weather:{condition:"Cerah"}} as any });
  ok("env last", ctx.resolved.source==="environment");
}

// Dismissed not in confirmedMemory -> should not influence
{
  const ctx=buildDailyContext({ date:"2026-08-25", userInput:{}, wellness:{snapshot:null,dailyState:null}, confirmedMemory: [], astro:null, environment:null });
  ok("no source -> none", ctx.resolved.source==="none");
}

console.log("--- V5-05 priority tests passed ---");
