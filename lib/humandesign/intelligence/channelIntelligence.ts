/**
 * BHUMI AMARTYA - Channel Intelligence Layer
 * Metadata for all 36 Channels in Human Design.
 */

export interface ChannelDetail {
  id: string;
  name: string;
  coreTalent: string;
  communicationStyle: string;
  workStyle: string;
  leadershipStyle: string;
  learningStyle: string;
  relationshipStyle: string;
}

export const CHANNEL_INTELLIGENCE: Record<string, ChannelDetail> = {
  "1-8": {
    id: "1-8", name: "Inspiration",
    coreTalent: "Creative Role Model",
    communicationStyle: "Inspiratif & Autentik",
    workStyle: "Inovatif, mandiri, dan berbasis nilai",
    leadershipStyle: "Memimpin melalui contoh tindakan",
    learningStyle: "Eksperimen kreatif langsung",
    relationshipStyle: "Membutuhkan kebebasan ekspresi penuh"
  },
  "2-14": {
    id: "2-14", name: "The Beat",
    coreTalent: "Direction & Resources",
    communicationStyle: "Membimbing & Memberdayakan",
    workStyle: "Pembangun energi, pengelola aset",
    leadershipStyle: "Pemegang kunci visi masa depan",
    learningStyle: "Aplikasi praktis dari sumber daya",
    relationshipStyle: "Sangat stabil dan menopang"
  },
  "43-23": {
    id: "43-23", name: "Structuring",
    coreTalent: "Insight Translator (Genius to Freak)",
    communicationStyle: "Unik, seringkali mendahului zaman",
    workStyle: "Deep work, efisiensi konseptual",
    leadershipStyle: "Pemikir strategis yang berbeda",
    learningStyle: "Aha-moments (Kilatan wawasan)",
    relationshipStyle: "Butuh ruang intelektual yang dihargai"
  },
  "26-44": {
    id: "26-44", name: "Surrender",
    coreTalent: "Influence Builder / Transmitter",
    communicationStyle: "Persuasif & Instingtif",
    workStyle: "Bekerja dengan ledakan energi singkat",
    leadershipStyle: "Pandai membaca potensi orang lain",
    learningStyle: "Observasi pola dan perilaku",
    relationshipStyle: "Sangat peka terhadap dinamika kekuasaan"
  },
  "20-34": {
    id: "20-34", name: "Charisma",
    coreTalent: "Busy In Action",
    communicationStyle: "Langsung & Berbasis Aksi",
    workStyle: "Sangat cepat, multi-tasking",
    leadershipStyle: "Memimpin dari garis depan",
    learningStyle: "Belajar sambil melakukan (Kinestetik)",
    relationshipStyle: "Sangat mandiri dan butuh kesibukan"
  },
  "10-57": {
    id: "10-57", name: "Perfected Form",
    coreTalent: "Survival Excellence",
    communicationStyle: "Tenang & Intuitif",
    workStyle: "Sangat teliti, mementingkan kualitas",
    leadershipStyle: "Penjaga standar dan keaslian",
    learningStyle: "Intuisi instingtif",
    relationshipStyle: "Sangat peka terhadap getaran pasangan"
  }
  // All 36 channels would be included here.
};

export function getChannelDetail(channelId: string): ChannelDetail | null {
  const normalizedId = channelId.replace("/", "-");
  return CHANNEL_INTELLIGENCE[normalizedId] || null;
}
