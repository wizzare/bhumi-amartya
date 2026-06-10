import { calculateHumanDesign } from "@/lib/humandesign/calculateHumanDesign";
import type { HumanDesignBirthProfile, HumanDesignChart } from "@/lib/humandesign/types";

export class HumanDesignService {
  static async generateChart(
    birthDate: string,
    birthTime: string,
    birthCity: string,
    options: Pick<HumanDesignBirthProfile, "birthCountry" | "latitude" | "longitude" | "timezone"> = {},
  ): Promise<HumanDesignChart> {
    return calculateHumanDesign({
      birthDate,
      birthTime,
      birthCity,
      ...options,
    });
  }
}
