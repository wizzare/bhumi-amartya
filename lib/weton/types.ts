export type JavaneseDay =
  | "Minggu"
  | "Senin"
  | "Selasa"
  | "Rabu"
  | "Kamis"
  | "Jumat"
  | "Sabtu";

export type Pasaran = "Legi" | "Pahing" | "Pon" | "Wage" | "Kliwon";

export interface WukuResult {
  name: string;
  index: number;
  description: string;
}

export interface PranataMangsaResult {
  name: string;
  description: string;
}

export interface WetonBlueprint {
  day: JavaneseDay;
  pasaran: Pasaran;
  weton: string;
  neptuDay: number;
  neptuPasaran: number;
  totalNeptu: number;
  wuku: WukuResult;
  pranataMangsa: PranataMangsaResult;
  watak: string;
  strengths: string[];
  challenges: string[];
  lifeMission: string;
  relationshipStyle: string;
  workStyle: string;
  moneyStyle: string;
}

export interface WetonInput {
  birthDate: string;
  birthTime?: string | null;
}
