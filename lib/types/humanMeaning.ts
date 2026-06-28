export interface HumanNarrative {
  short: string;
  medium: string;
  long: string;
}

export interface HumanMeaning {
  identity: HumanNarrative & { archetype: HumanNarrative; hiddenCharacter: HumanNarrative };
  purpose: HumanNarrative;
  energy: HumanNarrative & { authority: HumanNarrative; strategy: HumanNarrative; vitality: HumanNarrative; bodyMechanics: HumanNarrative };
  shadow: HumanNarrative & {
    emotionalNeeds: HumanNarrative;
    sabotage: HumanNarrative;
    triggers: HumanNarrative;
    ancestralLegacy: HumanNarrative;
    soulLesson: HumanNarrative;
    soulTrace: HumanNarrative;
    moneyBlock: HumanNarrative;
    loveBlock: HumanNarrative;
  };
  talents: HumanNarrative & { dna: HumanNarrative; potential: HumanNarrative; workStyle: HumanNarrative; wealthFlow: HumanNarrative };
  relationships: HumanNarrative & { attraction: HumanNarrative; pattern: HumanNarrative; loveLanguage: HumanNarrative; boundaries: HumanNarrative };
  timing: HumanNarrative & {
    season: HumanNarrative;
    semester1: HumanNarrative;
    semester2: HumanNarrative;
    currentState: HumanNarrative;
    dailyFocus: HumanNarrative;
    growthArea: HumanNarrative;
  };
  health: {
    chakra: HumanNarrative;
    digestion: HumanNarrative;
    environment: HumanNarrative;
    rhythm: HumanNarrative;
    element: HumanNarrative;
  };
  spirituality: {
    path: HumanNarrative;
    evolution: HumanNarrative;
    potential: HumanNarrative;
    talents: HumanNarrative;
    intuition: HumanNarrative;
    channeling: HumanNarrative;
    aura: HumanNarrative;
    clair: HumanNarrative;
  };
  soulIdentity: {
    mission: HumanNarrative;
    gifts: HumanNarrative;
    lessons: HumanNarrative;
    shadow: HumanNarrative;
    archetype: HumanNarrative;
  };
}
