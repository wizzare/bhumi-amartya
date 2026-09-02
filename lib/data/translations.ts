// @deprecated LEGACY ACCESSOR (V5-02) — reads from the canonical i18next
// resources in src/locales via lib/i18n. Kept only so existing
// `translations[language].section.key` consumers keep compiling while they
// migrate to i18next `t()` in later sprints. Do NOT add new keys here;
// add them to src/locales/{tag}/translation.json.
import { getCompatDictionaries } from "@/lib/i18n";

export const translations = getCompatDictionaries();
