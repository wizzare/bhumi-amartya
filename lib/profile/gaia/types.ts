export const GAIA_PROFILE_VERSION = "gaia-v1" as const;
export const GAIA_ENGINE_VERSION = "gaia-v1" as const;
export const GAIA_MIGRATION_VERSION = "gaia-v1" as const;

export type GaiaTheme = "shadow" | "talents" | "energy" | "relationships" | "career" | "spirituality";
export type GaiaInsightStrength = "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";

export type GaiaInsightMeta = {
  confidence: number;
  strength: GaiaInsightStrength;
  sourceCount: number;
  sourceRefs: string[];
  agreementScore: number;
  dataQualityScore: number;
  sensitive: boolean;
  publicSafe: boolean;
  updatedAt: string;
};

export type GaiaInsight = {
  id: string;
  theme: GaiaTheme;
  title: string;
  summary: string;
  narrative: string;
  dataPoints: GaiaDataPoint[];
  effect: string;
  strengths: string[];
  challenges: string[];
  needs: string[];
  guidance: string[];
  signals: string[];
  meta: GaiaInsightMeta;
};

export type GaiaDataPoint = {
  label: string;
  value: string;
  meaning: string;
  effect: string;
  score?: number;
  metric?: string;
};

export type GaiaIdentity = {
  lifePath: string;
  arcanaCenter: string;
  humanDesignType: string;
  sunSign: string;
};

export type GaiaProfile = {
  schema: "bhumi-gaia-profile";
  profileVersion: typeof GAIA_PROFILE_VERSION;
  engineVersion: typeof GAIA_ENGINE_VERSION;
  migrationVersion: typeof GAIA_MIGRATION_VERSION;
  identity: GaiaIdentity;
  sections: Record<GaiaTheme, GaiaInsight[]>;
  internal: {
    humanDesignAuthority: string | null;
    humanDesignDefinition: string | null;
    sourceAvailability: Record<string, boolean>;
  };
  generatedAt: string;
  updatedAt: string;
};

export type GaiaSignal = {
  id: string;
  theme: GaiaTheme;
  source: string;
  field: string;
  value: string;
  rawValue?: unknown;
  tags: string[];
  quality: number;
};
