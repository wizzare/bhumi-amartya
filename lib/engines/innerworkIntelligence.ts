import { WORKOUT_DATABASE, YOGA_DATABASE, HEALTHY_FOOD_DATABASE, InnerworkContent } from "@/lib/data/innerworkContent";
import { AstroHouseActivation } from "@/lib/astrology/astroHouseActivations";

export interface InnerworkRecommendationInput {
  activations: AstroHouseActivation[];
  hdType: string;
  lifePath: number;
  arcanaCenter: number;
}

export interface InnerworkRecommendationResult {
  workout: InnerworkContent & { reason: string };
  yoga: InnerworkContent & { reason: string };
  healthyFood: InnerworkContent & { reason: string };
}

export const innerworkIntelligence = {
  /**
   * Generates specific activity recommendations based on cosmic triggers and soul blueprint.
   */
  getRecommendations(input: InnerworkRecommendationInput): InnerworkRecommendationResult {
    const { activations, hdType, lifePath, arcanaCenter } = input;

    // 1. Determine Workout (Driven by Mars, HD Type, and Life Path)
    const marsTransit = activations.find(a => a.planet === "Mars");
    let workout: InnerworkContent & { reason: string };

    if (marsTransit && marsTransit.severity === "high") {
      workout = {
        ...WORKOUT_DATABASE["hiit-energy"],
        reason: `Karena Mars sedang intens mengaktifkan area ${marsTransit.lifeArea} kamu, tubuhmu butuh pelepasan energi yang kuat.`
      };
    } else if (hdType === "Projector" || hdType === "Reflector") {
      workout = {
        ...WORKOUT_DATABASE["gentle-stretch"],
        reason: `Sebagai seorang ${hdType}, sistem energimu membutuhkan pemulihan yang sadar hari ini agar tidak merasa terkuras.`
      };
    } else if (lifePath === 8 || lifePath === 1) {
      workout = {
        ...WORKOUT_DATABASE["hiit-energy"],
        reason: `Life Path ${lifePath} kamu memiliki daya dorong alami yang kuat; latihan intensitas tinggi akan menyeimbangkan ambisimu.`
      };
    } else if (lifePath === 4 || arcanaCenter === 4) {
      workout = {
        ...WORKOUT_DATABASE["steady-walk"],
        reason: "Struktur dan ritme konstan dari jalan cepat sangat selaras dengan kebutuhan stabilitas batinmu hari ini."
      };
    } else {
      workout = {
        ...WORKOUT_DATABASE["steady-walk"],
        reason: "Ritme konstan akan membantumu menjaga momentum energimu tetap stabil dan pikiran tetap jernih."
      };
    }

    // 2. Determine Yoga (Driven by Venus, LP, and HD)
    const venusTransit = activations.find(a => a.planet === "Venus");
    const moonTransit = activations.find(a => a.planet === "Moon");
    let yoga: InnerworkContent & { reason: string };

    if (hdType === "Manifesting Generator") {
      yoga = {
        ...YOGA_DATABASE["solar-confidence"],
        title: "Sacral Activation Yoga",
        reason: "Sebagai Manifesting Generator, yoga ini dirancang untuk menyelaraskan energi cepatmu dengan kekuatan pusat sakral."
      } as any;
    } else if (hdType === "Manifestor") {
      yoga = {
        ...YOGA_DATABASE["solar-confidence"],
        title: "Initiation Flow",
        reason: "Aliran ini mendukung dorongan alami Manifestor untuk memulai dan memimpin dari tempat yang tenang."
      } as any;
    } else if (lifePath === 7 || arcanaCenter === 9) {
      yoga = {
        ...YOGA_DATABASE["grounding-earth"],
        title: "Inner Wisdom Flow",
        reason: "Kombinasi blueprint-mu mengundang eksplorasi batin; yoga ini membantu menterjemahkan intuisi menjadi ketenangan fisik."
      } as any;
    } else if (lifePath === 9 || arcanaCenter === 6) {
      yoga = {
        ...YOGA_DATABASE["heart-opening"],
        title: "Compassion Flow",
        reason: "Blueprint jiwamu hari ini mengajak pada pelepasan dan kasih sayang; bukalah area jantung untuk melancarkan aliran emosi."
      } as any;
    } else if (lifePath === 8) {
      yoga = {
        ...YOGA_DATABASE["solar-confidence"],
        title: "Power Balance Flow",
        reason: "Untuk Life Path 8, yoga ini membantu menyeimbangkan kekuatan eksternal dengan keteguhan batin."
      } as any;
    } else if (venusTransit && (venusTransit.house === 7 || venusTransit.house === 2)) {
      yoga = {
        ...YOGA_DATABASE["heart-opening"],
        reason: `Venus di House ${venusTransit.house} mengundang keterbukaan dalam relasi dan rasa kebercukupan diri.`
      };
    } else {
      yoga = {
        ...YOGA_DATABASE["solar-confidence"],
        reason: "Hari ini adalah waktu yang tepat untuk memperkuat tekad dan keberanian internal melalui kesadaran tubuh."
      };
    }

    // 3. Determine Healthy Food (Driven by Daily Transit & Blueprint)
    const mercuryTransit = activations.find(a => a.planet === "Mercury");
    const saturnTransit = activations.find(a => a.planet === "Saturn");
    let healthyFood: InnerworkContent & { reason: string };

    const energyTheme = marsTransit ? "Action" : moonTransit ? "Emotion" : saturnTransit ? "Structure" : "Clarity";

    if (energyTheme === "Action" || lifePath === 1 || lifePath === 8) {
      healthyFood = {
        ...HEALTHY_FOOD_DATABASE["ginger-fire"],
        title: "Protein & Fire Boost",
        reason: "Blueprint dinamis kamu membutuhkan asupan yang menunjang stamina dan metabolisme api hari ini."
      } as any;
    } else if (energyTheme === "Emotion" || lifePath === 2 || lifePath === 6) {
      healthyFood = {
        ...HEALTHY_FOOD_DATABASE["turmeric-glow"],
        title: "Heart-Centered Freshness",
        reason: "Pusat emosionalmu sedang aktif; kunyit dan asam akan membantu mendinginkan batin dan menyegarkan rasa."
      } as any;
    } else if (energyTheme === "Structure" || lifePath === 4 || arcanaCenter === 4) {
      healthyFood = {
        ...HEALTHY_FOOD_DATABASE["grounding-food"],
        title: "Grounding Soup",
        reason: "Saat transit menuntut kedisiplinan, makanan dari akar bumi akan memberikan landasan energi yang kokoh."
      } as any;
    } else if (mercuryTransit && (mercuryTransit.isRetrograde || mercuryTransit.severity === "high")) {
      healthyFood = {
        ...HEALTHY_FOOD_DATABASE["lemongrass-calm"],
        title: "Calm Clarity Tea",
        reason: "Merkurius yang aktif memicu bising mental; serai akan membantu menenangkan saraf agar tetap jernih."
      } as any;
    } else {
      healthyFood = {
        ...HEALTHY_FOOD_DATABASE["turmeric-glow"],
        reason: "Sangat baik untuk membersihkan jalur energi agar tetap jernih dalam menjalani aktivitas harian."
      };
    }

    return { workout, yoga, healthyFood };
  }
};
