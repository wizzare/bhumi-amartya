import "./build115-network-guard.mjs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const firestore = require("firebase/firestore");
const blocked = () => { throw new Error("OFFLINE_TEST_PERSISTENCE_BLOCKED"); };
const guarded = { ...firestore };
for (const name of ["getDoc", "getDocFromCache", "getDocFromServer", "getDocs", "getDocsFromCache", "getDocsFromServer", "setDoc", "updateDoc", "addDoc", "deleteDoc", "writeBatch", "runTransaction", "onSnapshot"]) guarded[name] = blocked;
require.cache[require.resolve("firebase/firestore")]!.exports = guarded;
