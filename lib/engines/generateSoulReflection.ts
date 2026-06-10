import client from "../ai/openrouter";

type SoulReflectionInput = {
  name?: string;

  lifePath: number;
  arcanaCenter: number;

  sunSign: string;
  moonSign?: string;

  humanDesign: string;

  yearlyCycle?: number;

  mood?: string;

  emotionalTags?: string[];

  corePattern?: string;
};

export default async function generateSoulReflection({
  name,

  lifePath,
  arcanaCenter,

  sunSign,
  moonSign,

  humanDesign,

  yearlyCycle,

  mood,

  emotionalTags = [],

  corePattern,
}: SoulReflectionInput): Promise<string> {

  // -----------------------------
  // Build Emotional Context
  // -----------------------------

  const contextParts: string[] = [];

  contextParts.push(
    `Core growth pattern: ${lifePath}`
  );

  contextParts.push(
    `Inner integration pattern: ${arcanaCenter}`
  );

  contextParts.push(
    `Personal expression pattern: ${sunSign}`
  );

  if (moonSign) {

    contextParts.push(
      `Emotional rhythm pattern: ${moonSign}`
    );

  }

  contextParts.push(
    `Body rhythm pattern: ${humanDesign}`
  );

  if (yearlyCycle) {

    contextParts.push(
      `Yearly Cycle: ${yearlyCycle}`
    );

  }

  if (mood) {

    contextParts.push(
      `Current Mood: ${mood}`
    );

  }

  if (emotionalTags.length > 0) {

    contextParts.push(
      `Emotional Patterns: ${emotionalTags.join(", ")}`
    );

  }

  if (corePattern) {

    contextParts.push(
      `Core Emotional Pattern: ${corePattern}`
    );

  }

  const userContext =
    contextParts.join("\n");

  // -----------------------------
  // Gemini Prompt
  // -----------------------------

  const prompt = `
Kamu adalah AI emotional companion bernama Bhumi.

Tugasmu bukan meramal,
bukan menggurui,
dan bukan memberikan motivasi toxic positivity.

Tugasmu adalah membantu manusia merasa:
dipahami,
dilihat,
dan dipeluk lukanya dengan lembut.

STYLE WAJIB:
- Bahasa Indonesia
- Lembut
- Intimate
- Membumi
- Reflektif
- Hangat
- Tidak terlalu puitis
- Tidak seperti motivator
- Tidak seperti spiritual guru
- Tidak menggunakan bahasa Inggris
- Hindari kalimat klise seperti:
  "kamu kuat",
  "semesta mendukungmu",
  "energi positif"

FORMAT:
- Maksimal 3 paragraf pendek
- Gunakan spacing/napas
- Nyaman dibaca di mobile
- Fokus pada emotional truth
- Berikan gentle awareness
- Tutup dengan grounding ringan

PENTING:
Jangan menyebut label, angka, sistem, atau kategori spiritual user di output.
Terjemahkan semua konteks menjadi bahasa manusia yang alami.
Fokus pada pola emosional di balik kombinasi data tersebut.

========================
USER CONTEXT
========================

${userContext}

========================
OUTPUT
========================

Buat soul reflection personal.
`;

  // -----------------------------
  // Generate
  // -----------------------------

  try {
    if (!client) {
      throw new Error("OpenRouter client is not available in this runtime.");
    }

    const completion =
  await client.chat.completions.create({

    model:
      "deepseek/deepseek-chat-v3",

    messages: [

      {
        role: "system",

        content:
          "Kamu adalah AI emotional companion yang lembut dan membumi.",
      },

      {
        role: "user",

        content: prompt,
      },

    ],

  });

return (
  completion.choices[0]
    .message.content || ""
).trim();

  } catch (error) {

    console.error(
      "Gemini Reflection Error:",
      error
    );

    return `
Belakangan ini,
hidup mungkin terasa cukup melelahkan untuk hatimu.

Tidak semua hal harus diselesaikan hari ini.

Kadang,
beristirahat juga merupakan bagian dari proses pulang kepada diri sendiri.
    `.trim();

  }

}
