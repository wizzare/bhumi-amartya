type Input = {
  lifePath: number;
  arcanaCenter: number;
  mood?: string;
};

export default function generateShadowInsight(
  input: Input
) {

  const insights: string[] = [];

  // LIFE PATH 4 + ARCANA 8
  if (
    input.lifePath === 4 &&
    input.arcanaCenter === 8
  ) {

    insights.push(`
Ada bagian dalam dirimu
yang terbiasa menjadi penyangga
untuk banyak orang.

Karena itu,
kamu sering merasa sulit beristirahat
tanpa dihantui rasa bersalah.
    `);

  }

  // MOOD
  if (input.mood === "tired") {

    insights.push(`
Tubuhmu tampaknya sedang lelah
menahan terlalu banyak hal sekaligus.

Hari ini mungkin bukan tentang produktivitas,
tetapi tentang memberi ruang
agar dirimu bisa bernapas lebih pelan.
    `);

  }

  // FALLBACK
  if (insights.length === 0) {

    insights.push(`
Kadang luka tidak muncul
dalam bentuk tangisan,
tetapi dalam kebiasaan
untuk terus terlihat kuat.
    `);

  }

  return insights[0].trim();

}