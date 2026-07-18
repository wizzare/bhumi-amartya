type State = { founder?: boolean; badge?: string; membershipType?: string; membershipExpiry?: number; trialExpiry?: number };
const access = (s: State, now: number) => s.founder || ["PREMIUM", "INTI", "ALFA"].includes(s.membershipType || "") && (s.membershipExpiry || 0) > now || (s.badge === "Founder" || s.badge === "Inti" || s.badge === "Alfa") || (s.trialExpiry || 0) > now;
const now = Date.now();
if (!access({ membershipType: "PREMIUM", membershipExpiry: now + 1, trialExpiry: now - 1 }, now)) throw new Error("premium did not override expired trial");
if (access({ trialExpiry: now - 1 }, now)) throw new Error("expired trial remained active");
console.log("PREMIUM_TRIAL_PRECEDENCE_PASS");
export {};
