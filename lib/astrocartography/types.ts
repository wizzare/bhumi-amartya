export type AstrocartographyAngle = "MC" | "IC" | "ASC" | "DSC";
export type AstrocartographyBodyName = "Sun" | "Moon" | "Mercury" | "Venus" | "Mars" | "Jupiter" | "Saturn" | "Uranus" | "Neptune" | "Pluto";
export type GeoCoordinate = [longitude: number, latitude: number];

export type AstrocartographyBody = {
  body: AstrocartographyBodyName;
  eclipticLongitude: number;
  rightAscensionHours: number;
  declinationDegrees: number;
  retrograde: boolean;
  canonicalStatus: "canonical-tropical";
};

export type AstrocartographyLine = {
  lineId: string;
  body: AstrocartographyBodyName;
  angleType: AstrocartographyAngle;
  geometryType: "MultiLineString";
  coordinates: GeoCoordinate[][];
  longitudeReference: "-180_to_180_east_positive";
  validLatitudeRange: [number, number] | null;
  sourceVersion: "astrocartography-r8a-1";
  calculationStatus: "calculated";
};

export type AstrocartographyNearestLine = {
  lineId: string;
  body: AstrocartographyBodyName;
  angleType: AstrocartographyAngle;
  approximateDistanceKm: number;
  nearestCoordinate: GeoCoordinate;
};

export type AstrocartographyLocationAnalysis = {
  latitude: number;
  longitude: number;
  nearestLines: AstrocartographyNearestLine[];
  distanceMethod: "spherical-haversine-densified-polyline";
  orbPolicy: "nearest-line-ranking-only";
};

export type AstrocartographySelectedLocation = {
  locationId?: string;
  name: string;
  region: string | null;
  country: string;
  countryCode?: string | null;
  latitude: number;
  longitude: number;
};

export type AstrocartographyLocationLinePresentation = {
  planet: AstrocartographyBodyName;
  planetSymbol: string;
  angleType: AstrocartographyAngle;
  distanceKm: number;
  distanceLabel: string;
  themeSentences: string[];
  potentialItems: string[];
  challengeItems: string[];
  groundingInvitation: string;
  calculationStatus: "calculated";
};

export type AstrocartographyCuratedLocationResult = {
  locationId: string;
  locationName: string;
  region: string | null;
  country: string;
  countryCode: string | null;
  latitude: number;
  longitude: number;
  inclusionReason: "birthplace" | "user-selected";
  lines: AstrocartographyLocationLinePresentation[];
  overallTheme: string;
  integratedSummary: string;
  recommendedUses: string[];
  cautions: string[];
  sourceVersion: AstrocartographyResult["sourceVersion"];
  calculationStatus: "calculated" | "unavailable";
};

export type AstrocartographyOverallLocationSummary = {
  locationId: string;
  locationName: string;
  dominantTheme: string;
  bestFitActivities: string[];
  caution: string | null;
};

export type AstrocartographyCategoryName = "Ekonomi dan Peluang" | "Karier dan Visibilitas" | "Relasi dan Kolaborasi" | "Spiritualitas dan Kreativitas" | "Rumah dan Fondasi" | "Transformasi dan Pendewasaan" | "Pendidikan dan Pertumbuhan";

export type AstrocartographyCityReferenceResult = {
  cityId: string;
  cityName: string;
  region: string | null;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  nearestLines: AstrocartographyNearestLine[];
  lineInterpretations: Array<{ lineId: string; label: string; narrative: string }>;
  integratedSummary: string;
  inclusionReason: "nearest-ranked-domestic-reference" | "nearest-ranked-global-reference" | "additional-global-reference-no-domestic-slot";
  domesticOrGlobal: "domestic" | "global";
  categoryMatchReason: string;
  supportingLines: string[];
  rankingReason: string;
  datasetVersion: string;
};

export type AstrocartographyCategoryResult = {
  categoryId: string;
  categoryName: AstrocartographyCategoryName;
  dominantLineIds: string[];
  regions: string[];
  referenceCities: AstrocartographyCityReferenceResult[];
  domesticReferences: AstrocartographyCityReferenceResult[];
  globalReferences: AstrocartographyCityReferenceResult[];
  domesticCountryName: string | null;
  domesticAvailabilityMessage: string | null;
  interpretation: string;
  potentialItems: string[];
  challenge: string | null;
  groundingNote: string;
  calculationStatus: "calculated";
};

export type AstrocartographyAutomaticPresentation = {
  strongestCategory: AstrocartographyCategoryName;
  dominantTheme: string;
  dominantLineIds: string[];
  categories: AstrocartographyCategoryResult[];
  referenceCities: AstrocartographyCityReferenceResult[];
  overallRegions: AstrocartographyOverallLocationSummary[];
  summary: string[];
  safetyNote: string;
  privacyNotice: string;
  sourceVersion: AstrocartographyResult["sourceVersion"];
  cityDatasetVersion: string;
};

export type AstrocartographyLocationPresentation = {
  selectedLocation: AstrocartographySelectedLocation;
  nearestLine: {
    planet: AstrocartographyBodyName;
    angleType: AstrocartographyAngle;
    distanceKm: number;
    calculationStatus: "calculated";
  };
  interpretation: {
    meaning: string;
    livedEnergy: string;
    possibleInfluence: string;
    supportivePotential: string;
    possibleChallenge: string;
    locationKey: string;
  };
};

export type AstrocartographyResult = {
  systemName: "Astrocartography";
  birthDataStatus: "available" | "unavailable";
  accuracyNotice: string;
  calculationMethod: "GAST + equatorial-of-date angularity";
  utcInstant: string | null;
  julianDate: number | null;
  greenwichApparentSiderealTimeHours: number | null;
  samplingLatitudeStep: 2;
  bodies: AstrocartographyBody[];
  lines: AstrocartographyLine[];
  crossings: [];
  nearestLines: AstrocartographyNearestLine[];
  locationAnalysis: AstrocartographyLocationAnalysis | null;
  mapBounds: { west: -180; south: -90; east: 180; north: 90 };
  sourceVersion: "astrocartography-r8a-1";
  sourceClassification: "FOUNDER_APPROVED_FUNCTIONAL_RECONSTRUCTION";
};

export type AstrocartographyLineReading = {
  lineId: string;
  label: string;
  technicalExplanation: string;
  interpretation: string;
  supportiveExpression: string;
  possibleChallenge: string;
  groundingInvitation: string;
};

export type AstrocartographyPresentation = {
  hero: { eyebrow: "Astrocartography"; title: "Peta Langitmu di Atas Bumi"; lineCount: number; insight: string };
  accuracyNotice: string;
  lineReadings: AstrocartographyLineReading[];
  travelThemes: string;
  workThemes: string;
  relationshipThemes: string;
  homeThemes: string;
  growthThemes: string;
  summary: string[];
  availabilityStatus: AstrocartographyResult["birthDataStatus"];
  profileCard: { title: "Astrocartography"; insight: string; action: "Lihat peta selengkapnya"; href: "/blueprint/astrocartography" };
  sourceVersion: AstrocartographyResult["sourceVersion"];
  sourceClassification: AstrocartographyResult["sourceClassification"];
};
