export interface ProfileCard {
  title: string;
  shortMeaning: string;
  expandableInsight: string;
  actionableReflection: string;
  items?: ProfileCard[];
}

export interface ProfileSection {
  title: string;
  cards: ProfileCard[];
}

export interface ProfileRuntimeData {
  sections: ProfileSection[];
}
