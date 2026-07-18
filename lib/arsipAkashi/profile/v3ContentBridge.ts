import type { ProfileCard, ProfileSection } from "../../types/profileRuntime";
import type {
  ArsipAkashiProfileSoulLetter,
  ArsipAkashiProfileViewModel,
} from "./viewModel";

function applyReadingContent(
  card: ProfileCard,
  deepExplanation: string,
  practicalReflection: string,
  detailSections?: Array<{ title: string; body: string }>,
): ProfileCard {
  return {
    ...card,
    expandableInsight: deepExplanation,
    actionableReflection: practicalReflection,
    detailSections,
    items: card.items?.map((item) =>
      applyReadingContent(item, deepExplanation, practicalReflection, detailSections),
    ),
  };
}

/**
 * Keeps the approved V3 room/card metadata and visual shell, while transferring
 * ownership of every opened content field to the Arsip Akashi reading runtime.
 */
export function applyArsipAkashiContentToV3Section(
  section: ProfileSection,
  viewModel: ArsipAkashiProfileViewModel,
): ProfileSection | null {
  const roomReadings = viewModel.readings.filter(
    (reading) => reading.roomTitle === section.title,
  );
  const readingsByTitle = new Map(
    roomReadings.map((reading) => [reading.title, reading]),
  );

  if (section.title === "ASAL USUL & PERADABAN") {
    const cards = section.cards.map((card) => {
      const reading = readingsByTitle.get(card.title);
      if (!reading) return null;
      return {
        ...card,
        shortMeaning: reading.items?.map((item) => item.shortMeaning).join(" · ") ?? "",
        expandableInsight: reading.deepExplanation,
        actionableReflection: reading.practicalReflection,
        items: reading.items?.map((item) => ({
          title: item.title,
          shortMeaning: item.shortMeaning,
          expandableInsight: item.deepExplanation,
          actionableReflection: item.practicalReflection,
          detailSections: item.detailSections,
        })),
      };
    });

    if (cards.some((card) => card === null)) return null;
    return { ...section, cards: cards as ProfileCard[] };
  }

  if (section.title === "FASE KEHIDUPAN SAAT INI") {
    const orderedReadings = roomReadings.sort((a, b) => a.order - b.order);
    return {
      ...section,
      cards: section.cards.map((card, index) => {
        const reading = orderedReadings[index];
        return reading ? { ...card, title: reading.title, shortMeaning: reading.shortMeaning ?? card.shortMeaning, expandableInsight: reading.deepExplanation, actionableReflection: reading.practicalReflection, detailSections: reading.detailSections } : card;
      }),
    };
  }

  const cards = section.cards.map((card) => {
    const reading = readingsByTitle.get(card.title);
    if (!reading) return null;

    return applyReadingContent(
      card,
      reading.deepExplanation,
      reading.practicalReflection,
      reading.detailSections,
    );
  });

  if (cards.some((card) => card === null)) return null;

  return {
    ...section,
    cards: cards as ProfileCard[],
  };
}

function soulLetterToV3Card(letter: ArsipAkashiProfileSoulLetter): ProfileCard {
  return {
    title: letter.title,
    shortMeaning: letter.subtitle,
    expandableInsight: letter.deepExplanation,
    actionableReflection: "",
    displayStyle: "soul-letter",
  };
}

export function buildSoulLettersV3Section(
  viewModel: ArsipAkashiProfileViewModel,
): ProfileSection | null {
  if (viewModel.soulLetters.length !== 3) return null;

  return {
    title: "SURAT JIWA",
    cards: [...viewModel.soulLetters]
      .sort((a, b) => a.order - b.order)
      .map(soulLetterToV3Card),
  };
}
