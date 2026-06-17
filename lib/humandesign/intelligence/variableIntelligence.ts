/**
 * BHUMI AMARTYA - Variable (Lifestyle) Intelligence Layer
 * Interprets Variables into specific productivity and learning styles.
 */

export interface VariableLifestyle {
  digestion: {
    learningStyle: string;
    informationProcessing: string;
  };
  environment: {
    idealWork: string;
    recharge: string;
  };
  cognition: {
    naturalSensitivity: string;
  };
  motivation: {
    internalDriver: string;
  };
  perspective: {
    thinkingStyle: string;
  };
}

export const VARIABLE_INTELLIGENCE = {
  interpret(variables: Record<string, any> | null): VariableLifestyle {
    // Current variables are likely PRL DRR or similar string in fallback,
    // or an object from Python engine.
    // Handle both object-based values ({value: "left", tone: 3, ...}) and plain strings
    const resolveValue = (val: unknown): string => {
      if (val && typeof val === "object" && "value" in val) return String((val as Record<string, unknown>).value ?? "");
      return typeof val === "string" ? val : "";
    };
    const isLeft = (val: unknown) => {
      const str = resolveValue(val);
      return str.includes("L") || str.includes("left");
    };

    // Default values if variables are missing
    const defaultStyle: VariableLifestyle = {
      digestion: {
        learningStyle: "Sesuai kebutuhan",
        informationProcessing: "Fleksibel"
      },
      environment: {
        idealWork: "Tempat yang memberimu inspirasi",
        recharge: "Ruang yang tenang"
      },
      cognition: {
        naturalSensitivity: "Sesuai insting"
      },
      motivation: {
        internalDriver: "Panggilan diri"
      },
      perspective: {
        thinkingStyle: "Menyeluruh"
      }
    };

    if (!variables) return defaultStyle;

    // Logic based on standard 4-arrow system
    // Arrow 1: Top Left (Digestion)
    // Arrow 2: Bottom Left (Environment)
    // Arrow 3: Bottom Right (Perspective)
    // Arrow 4: Top Right (Motivation)

    const dl = isLeft(variables.top_left);
    const el = isLeft(variables.bottom_left);
    const pl = isLeft(variables.bottom_right);
    const ml = isLeft(variables.top_right);

    return {
      digestion: {
        learningStyle: dl ? "Terstruktur & Fokus" : "Pasif & Luas (Absorbing)",
        informationProcessing: dl ? "Logis & Detail" : "Holistik & Intuitif"
      },
      environment: {
        idealWork: el ? "Tempat yang Tetap/Statis" : "Tempat yang Dinamis/Berubah",
        recharge: el ? "Ruang Privat Teratur" : "Lingkungan Luar yang Hidup"
      },
      cognition: {
        naturalSensitivity: pl ? "Sangat Terarah (Focused)" : "Luas (Peripheral)"
      },
      motivation: {
        internalDriver: ml ? "Rasa Butuh (Fear/Hunger)" : "Harapan/Keinginan (Innocence/Desire)"
      },
      perspective: {
        thinkingStyle: pl ? "Linear & Analitis" : "Kontekstual & Luas"
      }
    };
  }
};
