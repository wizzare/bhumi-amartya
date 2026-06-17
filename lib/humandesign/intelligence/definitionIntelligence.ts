/**
 * BHUMI AMARTYA - Definition Intelligence Layer
 */

export interface DefinitionStyle {
  processingStyle: string;
  collaborationStyle: string;
  decisionPattern: string;
}

export const DEFINITION_INTELLIGENCE: Record<string, DefinitionStyle> = {
  "Single Definition": {
    processingStyle: "Sangat mandiri dan terintegrasi secara batin",
    collaborationStyle: "Bekerja baik sendirian atau memimpin tim kecil",
    decisionPattern: "Konsisten dan tidak mudah terpengaruh distraksi luar"
  },
  "Split Definition": {
    processingStyle: "Membutuhkan orang lain untuk menghubungkan ide-ide batin",
    collaborationStyle: "Sangat efektif dalam tim; mencari bagian yang hilang",
    decisionPattern: "Bisa merasa terbagi jika tidak memberi waktu untuk sinkronisasi"
  },
  "Triple Split": {
    processingStyle: "Sangat cepat tetapi butuh lingkungan yang variatif",
    collaborationStyle: "Suka berada di tempat ramai untuk mendapatkan 'jembatan' energi",
    decisionPattern: "Membutuhkan waktu paling lama untuk merasa benar-benar utuh"
  },
  "Quadruple Split": {
    processingStyle: "Sangat stabil namun memiliki banyak lapisan energi",
    collaborationStyle: "Sangat spesifik dalam memilih rekan kerja",
    decisionPattern: "Melihat dari banyak sudut pandang sebelum menyimpulkan"
  }
};

export function getDefinitionStyle(label: string | null): DefinitionStyle {
  return DEFINITION_INTELLIGENCE[label || "Single Definition"] || DEFINITION_INTELLIGENCE["Single Definition"];
}
