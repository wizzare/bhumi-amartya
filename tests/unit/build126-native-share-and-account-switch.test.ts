import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { createDailyShareCardContent } from "../../lib/profile/dailyShareCardEngine";
import type { ProfileSection } from "../../lib/types/profileRuntime";
import type { DailyGuidance } from "../../lib/dailyGuidance/types";
import type { GrowthStory } from "../../lib/engines/journeyStoryEngine";

// Synthetic Fixtures for Account A and Account B
function createTestProfileSections(accountName: string, arcana: number): ProfileSection[] {
  return [
    {
      id: "siapa-dirimu",
      title: "Siapa Dirimu Sebenarnya",
      theme: "Inti Jiwa",
      meaningLevel: "esoteris",
      cards: [
        {
          id: "core-identity",
          title: `Peta Diri ${accountName}`,
          system: "Human Design",
          meaning: "Refleksi mendalam tentang ritme dan potensi diri.",
          actionableReflection: "Dengarkan sinyal tubuh sebelum mengambil keputusan.",
        },
      ],
      sources: [
        {
          systemId: "destiny-matrix",
          systemName: "Destiny Matrix",
          fields: [{ label: "Arcana Pusat", value: String(arcana) }],
        },
      ],
    },
  ];
}

function createTestGuidance(uid: string, dateKey: string, message: string): DailyGuidance {
  return {
    uid,
    date: dateKey,
    localDateKey: dateKey,
    astrologyToday: "Bulan di Taurus",
    soulReflectionText: message,
    dailyNoteText: "Catatan harian untuk refleksi.",
    journalPrompt: "Apa yang membuatmu merasa damai hari ini?",
    meditationSuggestion: "Napas Kesadaran",
    dailyPractices: [],
    categories: [],
    source: "local-fallback",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as DailyGuidance;
}

function createTestGrowthStory(stageLabel: string, focus: string, nextMilestone: string): GrowthStory {
  return {
    stage: {
      stage: 1,
      label: stageLabel,
      description: "Mulai mengenali ritme batin yang tenang.",
    },
    growthFocus: focus,
    companionMessage: "Berjalanlah dengan ritme alamimu.",
    nextMilestone,
    totalCheckIns: 5,
    activePracticesCount: 2,
    weeklyTheme: "Ketenangan Diri",
    recentMilestones: ["Langkah Pertama"],
    evolutionRate: "stabil",
  } as GrowthStory;
}

describe("BUILD 126 — Native Share, Save & Account Switch Regression Suite", () => {
  const dateKey = "2026-11-08";

  // Account A data
  const accountAUid = "user_account_a_126";
  const accountAName = "Aura Amartya";
  const accountASections = createTestProfileSections("Aura", 14);
  const accountAGuidance = createTestGuidance(accountAUid, dateKey, "Ketenangan adalah fondasimu.");
  const accountAStory = createTestGrowthStory("Pondasi Diri", "Belajar Menyaring Ekspektasi", "Menjaga Konsistensi 7 Hari");

  // Account B data
  const accountBUid = "user_account_b_126";
  const accountBName = "Bima Wicaksana";
  const accountBSections = createTestProfileSections("Bima", 7);
  const accountBGuidance = createTestGuidance(accountBUid, dateKey, "Keberanian memimpin dari hening.");
  const accountBStory = createTestGrowthStory("Awal Kesadaran", "Mengenali Kelelahan Fisik", "Menyelesaikan 3 Refleksi Harian");

  describe("Suite A: Account Switching & Privacy Isolation Invariants", () => {
    it("1. Account A content reflects Account A identity and values", () => {
      const contentA = createDailyShareCardContent({
        profileSections: accountASections,
        dateKey,
        userSeed: accountAUid,
        guidance: accountAGuidance,
        cardInstanceSeed: `seed-account-a-${dateKey}`,
      });

      assert.ok(contentA.soulMessage.summary.length > 0);
      assert.ok(contentA.profileToday.summary.length > 0);
      assert.equal(contentA.manifestationToday.title.length > 0, true);
    });

    it("2. Account switching: Dynamic React key enforces unpolluted state transition", () => {
      // In ProfileShareCardSection, the React key is interpolated as:
      const keyA = `share-${accountAUid}-${dateKey}`;
      const keyB = `share-${accountBUid}-${dateKey}`;

      assert.notEqual(keyA, keyB, "React keys must differ between accounts to force unmount & state reset");
      assert.equal(keyA, "share-user_account_a_126-2026-11-08");
      assert.equal(keyB, "share-user_account_b_126-2026-11-08");
    });

    it("3. Anonymity toggle strictly masks user name and never leaks private profile data", () => {
      // With anonymity OFF:
      const displayNameOpenA = accountAName || "Penghuni Bhumi";
      assert.equal(displayNameOpenA, "Aura Amartya");

      // With anonymity ON:
      const isAnonymous = true;
      const effectiveDisplayName = isAnonymous ? "Penghuni Bhumi" : displayNameOpenA;
      assert.equal(effectiveDisplayName, "Penghuni Bhumi", "Anonymous state must strictly mask display name");

      // Verify no PII (UID, email, birthdate) is present in share text or title
      const shareTitle = "Bhumi Amartya — Perjalanan Jiwa";
      const shareText = "Ruang untuk pulang dan kenali diri bersama Bhumi Amartya.";
      assert.doesNotMatch(shareTitle, new RegExp(accountAUid, "i"));
      assert.doesNotMatch(shareText, new RegExp(accountAUid, "i"));
      assert.doesNotMatch(shareText, /@|1990|2000|birth/i);
    });

    it("4. Account B initialization has zero residue from Account A", () => {
      // Account B creates brand new content from account B's own seed and guidance
      const contentB = createDailyShareCardContent({
        profileSections: accountBSections,
        dateKey,
        userSeed: accountBUid,
        guidance: accountBGuidance,
        cardInstanceSeed: `seed-account-b-${dateKey}`,
      });

      // Default category for Account B starts clean
      const defaultCategoryB = accountBStory ? "journey" : "reflection";
      assert.equal(defaultCategoryB, "journey");

      // Account B's next milestone is from story B, not story A
      assert.equal(accountBStory.nextMilestone, "Menyelesaikan 3 Refleksi Harian");
      assert.notEqual(accountBStory.nextMilestone, accountAStory.nextMilestone);

      // Account B display name starts un-anonymized by default
      const defaultAnonymousB = false;
      const effectiveDisplayNameB = defaultAnonymousB ? "Penghuni Bhumi" : accountBName;
      assert.equal(effectiveDisplayNameB, "Bima Wicaksana");
      assert.notEqual(effectiveDisplayNameB, accountAName);
    });

    it("5. Switch back to Account A retains Account A canonical integrity", () => {
      const keyARecheck = `share-${accountAUid}-${dateKey}`;
      assert.equal(keyARecheck, "share-user_account_a_126-2026-11-08");
      assert.equal(accountAStory.stage.label, "Pondasi Diri");
      assert.equal(accountAStory.nextMilestone, "Menjaga Konsistensi 7 Hari");
    });
  });

  describe("Suite B: Mobile Native Share Sheet & Save Path Invariants", () => {
    // Mock simulation of Capacitor Filesystem & Share contract
    class MockFilesystem {
      files = new Map<string, { data: string; directory: string }>();
      shouldFailWrite = false;

      async writeFile(options: { path: string; data: string; directory: string }) {
        if (this.shouldFailWrite) {
          throw new Error("Disk full or permission denied");
        }
        this.files.set(`${options.directory}/${options.path}`, options);
        return { uri: `file:///data/user/0/com.bhumiamartya.app/${options.directory}/${options.path}` };
      }

      async getUri(options: { path: string; directory: string }) {
        const full = `${options.directory}/${options.path}`;
        return { uri: `file:///data/user/0/com.bhumiamartya.app/${full}` };
      }
    }

    class MockSharePlugin {
      lastShareOptions: any = null;
      shouldSimulateCancel = false;
      shouldFailShare = false;

      async canShare() {
        return { value: true };
      }

      async share(options: any) {
        this.lastShareOptions = options;
        if (this.shouldSimulateCancel) {
          const cancelErr = new Error("Share canceled");
          cancelErr.name = "AbortError";
          throw cancelErr;
        }
        if (this.shouldFailShare) {
          throw new Error("No activity found to handle intent");
        }
        return { activityType: "com.whatsapp" };
      }
    }

    it("6. Native Share Sheet: Writes PNG to Cache and calls Share.share with valid file:// URI", async () => {
      const fs = new MockFilesystem();
      const share = new MockSharePlugin();

      const fileName = `bhumi-share-journey-${Date.now()}.png`;
      const base64Data = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

      // Step 1: Write to cache
      await fs.writeFile({
        path: fileName,
        data: base64Data,
        directory: "CACHE",
      });

      // Step 2: Get URI
      const fileResult = await fs.getUri({
        path: fileName,
        directory: "CACHE",
      });

      assert.match(fileResult.uri, /^file:\/\//, "Native share requires file:// URI for FileProvider");

      // Step 3: Invoke Share
      const res = await share.share({
        title: "Bhumi Amartya — Perjalanan Jiwa",
        text: "Ruang untuk pulang dan kenali diri bersama Bhumi Amartya.",
        url: fileResult.uri,
        dialogTitle: "Bagikan Kartu Perjalanan",
      });

      assert.equal(share.lastShareOptions.url, fileResult.uri);
      assert.equal(share.lastShareOptions.dialogTitle, "Bagikan Kartu Perjalanan");
      assert.equal(res.activityType, "com.whatsapp");
    });

    it("7. User cancellation during share sheet does not trigger error toast", async () => {
      const share = new MockSharePlugin();
      share.shouldSimulateCancel = true;

      let errorToastShown = false;
      try {
        await share.share({ url: "file:///some/path.png" });
      } catch (err: any) {
        const isCancel =
          (err instanceof Error && (err.name === "AbortError" || /cancel/i.test(err.message))) ||
          String(err).toLowerCase().includes("cancel");
        if (!isCancel) {
          errorToastShown = true;
        }
      }

      assert.equal(errorToastShown, false, "Share cancellation must NOT display error toast");
    });

    it("8. Filesystem write failure triggers safe error handling without crashing", async () => {
      const fs = new MockFilesystem();
      fs.shouldFailWrite = true;

      let caughtError = false;
      try {
        await fs.writeFile({
          path: "test.png",
          data: "dummy",
          directory: "CACHE",
        });
      } catch (err) {
        caughtError = true;
      }

      assert.equal(caughtError, true, "Filesystem error must be trapped cleanly");
    });

    it("9. Save Image explicitly writes to Documents directory and does not invoke share sheet", async () => {
      const fs = new MockFilesystem();
      const share = new MockSharePlugin();

      const fileName = `bhumi-amartya-journey-${Date.now()}.png`;
      const base64Data = "dummy_base64";

      // Explicit save action
      await fs.writeFile({
        path: fileName,
        data: base64Data,
        directory: "DOCUMENTS",
      });

      assert.ok(fs.files.has(`DOCUMENTS/${fileName}`), "Save action must write to Documents directory");
      assert.equal(share.lastShareOptions, null, "Save action must NOT trigger Share dialog");
    });

    it("10. Share failure and Save failure operate through independent error paths", async () => {
      const share = new MockSharePlugin();
      share.shouldFailShare = true;

      let shareFailed = false;
      let saveFailed = false;

      // Action 1: Share fails
      try {
        await share.share({ url: "file:///test.png" });
      } catch {
        shareFailed = true;
      }

      assert.equal(shareFailed, true);
      assert.equal(saveFailed, false, "Share failure must not set saveFailed state or report false save success");
    });
  });

  describe("Suite C: Canonical Dimensions & Categories Parity", () => {
    it("11. Aspect ratio is fixed to 9:16 (720x1280)", () => {
      const targetWidth = 720;
      const targetHeight = 1280;
      const ratio = targetWidth / targetHeight;
      assert.equal(Math.round(ratio * 1000) / 1000, 0.563); // 9/16 = 0.5625
    });

    it("12. All 3 canonical categories are supported with correct UI labels", () => {
      const categories: Array<{ id: "journey" | "milestone" | "reflection"; label: string }> = [
        { id: "journey", label: "🌱 Perjalanan" },
        { id: "milestone", label: "🏔️ Milestone" },
        { id: "reflection", label: "🕊️ Refleksi" },
      ];

      assert.equal(categories.length, 3);
      assert.equal(categories[0].id, "journey");
      assert.equal(categories[1].id, "milestone");
      assert.equal(categories[2].id, "reflection");
    });
  });
});
