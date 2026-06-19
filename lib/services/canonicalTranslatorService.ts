import type { Blueprint } from "@/lib/types/blueprint";
import type {
  CanonicalIdentity,
  CanonicalIdentityDomain,
  CanonicalPurposeDomain,
  CanonicalEnergyDomain,
  CanonicalShadowDomain,
  CanonicalTalentsDomain,
  CanonicalRelationshipsDomain,
  CanonicalTimingDomain,
  CanonicalHealthDomain,
  CanonicalSpiritualityDomain,
} from "@/lib/types/canonical";

export class CanonicalTranslatorService {
  private static text(value: unknown): string {
    return typeof value === "string" ? value : "";
  }

  public static translate(blueprint: Blueprint): CanonicalIdentity {
    return {
      identity: this.buildIdentity(blueprint),
      purpose: this.buildPurpose(blueprint),
      energy: this.buildEnergy(blueprint),
      shadow: this.buildShadow(blueprint),
      talents: this.buildTalents(blueprint),
      relationships: this.buildRelationships(blueprint),
      timing: this.buildTiming(blueprint),
      health: this.buildHealth(blueprint),
      spirituality: this.buildSpirituality(blueprint),
    };
  }

  private static buildIdentity(blueprint: Blueprint): CanonicalIdentityDomain {
    return {
      sunSign: blueprint.astrology?.sunSign || "Unknown",
      hdProfile: blueprint.humanDesign?.profile || "Unknown",
      hiddenCharacter: {
        soulUrge: Number((blueprint.numerology as unknown as { soulUrge?: number })?.soulUrge || 0),
        moonSign: blueprint.astrology?.moonSign || "",
        chartHeart: blueprint.destinyMatrix?.chartHeart || {},
      },
    };
  }

  private static buildPurpose(blueprint: Blueprint): CanonicalPurposeDomain {
    return {
      lifePath: blueprint.numerology?.number || 0,
      destinyPoint: blueprint.destinyMatrix?.destinyPoint || 0,
    };
  }

  private static buildEnergy(blueprint: Blueprint): CanonicalEnergyDomain {
    return {
      authority: blueprint.humanDesign?.authority || "Unknown",
      strategy: blueprint.humanDesign?.strategy || "Unknown",
      dominantElement: blueprint.bazi?.dayMaster?.element || "Unknown",
      vitality: {
        elementBalance: { ...(blueprint.bazi?.fiveElements || {}) },
        sacralDefined: blueprint.humanDesign?.centers?.sacral === true,
        chakraPhysics: Object.fromEntries(Object.entries(
          blueprint.destinyMatrix?.chakraMatrix
          || blueprint.destinyMatrix?.healthChart
          || blueprint.destinyMatrix?.destinyIntelligence?.healthChart
          || {}
        ).map(([key, value]) => [key, value.physics || 0])),
      },
    };
  }

  private static buildShadow(blueprint: Blueprint): CanonicalShadowDomain {
    return {
      karmicTail: blueprint.destinyMatrix?.karmicTail || [],
      chiron: blueprint.astrology?.chiron || "Unknown",
      emotionalNeeds: { moonSign: blueprint.astrology?.moonSign || "", chartHeart: blueprint.destinyMatrix?.chartHeart || {} },
      emotionalTriggers: {
        mars: blueprint.astrology?.planets?.Mars?.sign || "",
        pluto: blueprint.astrology?.planets?.Pluto?.sign || "",
        aspects: (blueprint.astrology?.aspects || [])
          .filter((aspect) => ["Mars", "Pluto"].includes(aspect.p1) || ["Mars", "Pluto"].includes(aspect.p2))
          .map((aspect) => `${aspect.p1} ${aspect.type} ${aspect.p2}`),
        chartHeart: blueprint.destinyMatrix?.chartHeart || {},
      },
      ancestralLegacy: {
        fatherLine: blueprint.destinyMatrix?.fatherLine || [],
        motherLine: blueprint.destinyMatrix?.motherLine || [],
        ancestorLine: blueprint.destinyMatrix?.ancestorLine || [],
        vedicChallenges: blueprint.vedic?.challenges || [],
      },
      soulLesson: {
        northNode: blueprint.astrology?.northNode || blueprint.astrology?.planets?.NorthNode?.sign || "",
        southNode: blueprint.astrology?.southNode || blueprint.astrology?.planets?.SouthNode?.sign || "",
        rahu: blueprint.vedic?.planets?.Rahu?.sign || "",
        ketu: blueprint.vedic?.planets?.Ketu?.sign || "",
      },
      soulTrace: {
        karmicTail: blueprint.destinyMatrix?.karmicTail || [],
        occultSeal: blueprint.tzolkin?.oracle?.occult?.seal?.name || "",
        occultLesson: blueprint.tzolkin?.oracle?.occult?.tone?.lesson || "",
      },
      moneyBlock: {
        moneyLine: blueprint.destinyMatrix?.moneyLine || [],
        unfavorableElements: blueprint.bazi?.unfavorableElements || [],
        secondHouse: blueprint.astrology?.houses?.house2?.sign || blueprint.astrology?.wholeSignHouses?.house2?.sign || "",
        eighthHouse: blueprint.astrology?.houses?.house8?.sign || blueprint.astrology?.wholeSignHouses?.house8?.sign || "",
      },
      loveBlock: {
        loveLine: blueprint.destinyMatrix?.loveLine || [],
        venus: blueprint.astrology?.planets?.Venus?.sign || "",
      },
    };
  }

  private static buildTalents(blueprint: Blueprint): CanonicalTalentsDomain {
    return {
      matrixTalents: blueprint.destinyMatrix?.talentsFather || [],
      hdType: blueprint.humanDesign?.type || "Unknown",
      potentialTalents: {
        tenGods: (blueprint.bazi?.tenGods || []).map((entry) => entry.tenGod),
        majorYogas: (blueprint.vedic?.majorYogas || []).map((yoga) => yoga.name),
        supportiveAspects: (blueprint.astrology?.aspects || [])
          .filter((aspect) => aspect.type === "Trine" || aspect.type === "Sextile")
          .map((aspect) => `${aspect.p1} ${aspect.type} ${aspect.p2}`),
      },
      workStyle: {
        baziCareer: blueprint.bazi?.careerStyle || "",
        midheaven: blueprint.astrology?.midheaven || blueprint.astrology?.mc || "",
        moneyLine: blueprint.destinyMatrix?.moneyLine || [],
      },
      wealthFlow: {
        moneyLine: blueprint.destinyMatrix?.moneyLine || [],
        wealthYogas: (blueprint.vedic?.majorYogas || []).filter((yoga) => yoga.name === "Dhana Yoga").map((yoga) => yoga.evidence),
        moneyStyle: blueprint.bazi?.moneyStyle || "",
      },
    };
  }

  private static buildRelationships(blueprint: Blueprint): CanonicalRelationshipsDomain {
    const darakaraka = blueprint.vedic?.darakaraka;
    return {
      loveLine: blueprint.destinyMatrix?.loveLine || [],
      darakaraka: darakaraka ? darakaraka.planet : "",
      relationshipStyle: blueprint.tzolkin?.relationshipStyle || blueprint.bazi?.relationshipStyle || "",
      loveLanguage: {
        elementBalance: { ...(blueprint.bazi?.fiveElements || {}) },
        venus: blueprint.astrology?.planets?.Venus?.sign || "",
      },
      healthyBoundaries: {
        undefinedCenters: Object.entries(blueprint.humanDesign?.centers || {}).filter(([, defined]) => defined === false).map(([center]) => center),
        chartHeart: blueprint.destinyMatrix?.chartHeart || {},
      },
    };
  }

  private static buildTiming(blueprint: Blueprint): CanonicalTimingDomain {
    return {
      currentDasha: blueprint.vedic?.currentMahadasha?.planet || "",
      yearlyArcana: blueprint.destinyMatrix?.yearlyArcana || 0,
      currentAntardasha: blueprint.vedic?.currentAntardasha?.planet || "",
      currentState: blueprint.status,
      dailyFocus: blueprint.tzolkin?.lifePurpose || "",
      growthArea: blueprint.tzolkin?.growthStyle || "",
    };
  }

  private static buildHealth(blueprint: Blueprint): CanonicalHealthDomain {
    return {
      chakraMatrix:
        blueprint.destinyMatrix?.chakraMatrix
        || blueprint.destinyMatrix?.healthChart
        || blueprint.destinyMatrix?.destinyIntelligence?.healthChart
        || {},
      hdDigestion: this.text(blueprint.humanDesign?.digestion ?? blueprint.humanDesign?.variables?.digestion),
      hdEnvironment: this.text(blueprint.humanDesign?.environment ?? blueprint.humanDesign?.variables?.environment),
      hdType: this.text(blueprint.humanDesign?.type),
      baziElement: this.text(blueprint.bazi?.dayMaster?.element),
    };
  }

  private static buildSpirituality(blueprint: Blueprint): CanonicalSpiritualityDomain {
    const atmakaraka = blueprint.vedic?.atmakaraka;
    const centers = blueprint.humanDesign?.centers;

    return {
      vedicNinthHouse: this.text(blueprint.vedic?.spiritualStyle),
      vedicAtmakaraka: atmakaraka
        ? `${atmakaraka.planet} di ${atmakaraka.sign}, rumah ${atmakaraka.house}`
        : "",
      destinyHighArcana: blueprint.destinyMatrix?.arcanaCenter || 0,
      destinyTalents: blueprint.destinyMatrix?.talentsFather || [],
      hdCognition: this.text(blueprint.humanDesign?.cognition ?? blueprint.humanDesign?.variables?.cognition),
      hdHeadAjnaDefined: centers?.head === true && centers?.ajna === true,
      hdAura: this.text(blueprint.humanDesign?.type),
      clairIndicators: {
        destinyTalents: blueprint.destinyMatrix?.talentsFather || [],
        spleenDefined: centers?.spleen === true,
        ajnaDefined: centers?.ajna === true,
        solarPlexusDefined: centers?.solarPlexus === true,
      },
    };
  }
}
