import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { SafetyState } from "@/lib/engines/safetySentinelEngine";

export interface TrustedContact {
  name: string;
  phone: string;
  relation: string;
  isActive: boolean;
}

export interface SafetyConfig {
  trustedContact?: TrustedContact;
  preWrittenMessage: {
    id: string;
    en: string;
  };
}

const SAFETY_STATE_COLLECTION = "safetyStates";
const SAFETY_CONFIG_COLLECTION = "safetyConfigs";

export const safetyRepository = {
  async saveSafetyState(uid: string, state: SafetyState): Promise<void> {
    const docRef = doc(db, SAFETY_STATE_COLLECTION, uid);
    await setDoc(docRef, { ...state, uid, updatedAt: new Date().toISOString() });
  },

  async getSafetyState(uid: string): Promise<SafetyState | null> {
    const docRef = doc(db, SAFETY_STATE_COLLECTION, uid);
    const snap = await getDoc(docRef);
    return snap.exists() ? (snap.data() as SafetyState) : null;
  },

  async saveSafetyConfig(uid: string, config: SafetyConfig): Promise<void> {
    const docRef = doc(db, SAFETY_CONFIG_COLLECTION, uid);
    await setDoc(docRef, { ...config, uid });
  },

  async getSafetyConfig(uid: string): Promise<SafetyConfig | null> {
    const docRef = doc(db, SAFETY_CONFIG_COLLECTION, uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) return snap.data() as SafetyConfig;

    // Default config
    return {
      preWrittenMessage: {
        id: "Halo, saya sedang berada di fase yang berat dan butuh teman bicara. Bisa tolong hubungi saya?",
        en: "Hi, I'm going through a heavy phase and need someone to talk to. Could you reach out?"
      }
    };
  }
};
