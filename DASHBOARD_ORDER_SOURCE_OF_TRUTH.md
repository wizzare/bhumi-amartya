# Dashboard Order Source of Truth (KARA V3 / Gaia)

## 1. Official Sequence
According to `docs/BHUMI_V3_GAIA_CURRENT_PAGE_STRUCTURE.md` (Locked Specification):

1.  **DashboardHeader** (Greeting)
2.  **AccuracyUpgradeBanner** (Data Maintenance)
3.  **GuardianIdentityCard** (Status)
4.  **CoreIdentity** (Identity Anchor)
5.  **SoulReflectionCard** (Refleksi Jiwa / Mirror)
6.  **AstroTodayCard** (Astro Hari Ini / Intelligence)
7.  **DailyNoteV2** (Catatan Hari Ini / Compass)
8.  **DailyUserFlowGuide** (Journey Path)

---

## 2. Validation Result
- **Current Code Status:** **ALIGNED**. The `DashboardClient.tsx` currently follows this sequence (Mirror -> Astro -> Catatan).
- **Modification Rule:** **DO NOT MODIFY**. The current order is the approved specification for the Gaia release.
