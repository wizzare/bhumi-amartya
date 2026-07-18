export interface ProfileCard {
  title: string;
  shortMeaning: string;
  expandableInsight: string;
  actionableReflection: string;
  displayStyle?: "standard" | "soul-letter";
  detailSections?: Array<{ title: string; body: string }>;
  items?: ProfileCard[];
}

export interface ProfileSection {
  title: string;
  cards: ProfileCard[];
}

export interface ProfileRuntimeData {
  sections: ProfileSection[];
}
