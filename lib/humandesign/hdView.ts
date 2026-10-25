import { getHdState } from "./hdState";
import { getHumanDesignCompleteness } from "./completeness";
import { compareBirthInputMatch } from "./birthFingerprint";
import { isHdRecoveryDue } from "./hdRecovery";
import type { HumanDesignChart } from "./types";

export type HdUiState = "loading" | "ready_canonical" | "ready_historical" | "pending" | "retryable_error" | "exhausted" | "missing_blueprint" | "read_error" | "offline_with_valid_cache" | "offline_without_cache" | "authentication_required" | "input_revision_mismatch" | "cancelled";

export const hdUiCopy: Record<HdUiState, string> = {
  loading: "Memuat Human Design…",
  ready_canonical: "Chart lengkap dan sesuai data kelahiran saat ini.",
  ready_historical: "Data historis. Kesesuaian dengan data kelahiran saat ini belum terverifikasi.",
  pending: "Human Design belum selesai. Periksa data kelahiran atau coba lagi nanti.",
  retryable_error: "Layanan belum tersedia. Chart tersimpan tetap dipertahankan.",
  exhausted: "Batas percobaan tercapai. Periksa data kelahiran sebelum melanjutkan.",
  missing_blueprint: "Blueprint belum tersedia. Lengkapi data kelahiran terlebih dahulu.",
  read_error: "Human Design belum dapat dibaca. Silakan coba lagi.",
  offline_with_valid_cache: "Offline. Menampilkan chart yang sebelumnya dikonfirmasi server.",
  offline_without_cache: "Offline. Cache tidak tersedia, kedaluwarsa, atau belum sesuai data saat ini.",
  authentication_required: "Masuk kembali untuk membaca Human Design.",
  input_revision_mismatch: "Data kelahiran berubah. Chart lama tidak ditampilkan sebagai hasil saat ini.",
  cancelled: "Pemulihan dibatalkan. Data tersimpan tidak dihapus.",
};

export function selectHdView(uid: string, blueprint: Record<string, unknown> | null, input: Record<string, unknown> | null) {
  if (!uid) return { state: "authentication_required" as HdUiState, chart: null };
  if (!blueprint) return { state: "missing_blueprint" as HdUiState, chart: null };
  if (blueprint.uid !== uid) return { state: "read_error" as HdUiState, chart: null };
  const hd = blueprint.humanDesign;
  const match = compareBirthInputMatch(uid, hd, input);
  if (match === "CHANGED") return { state: "input_revision_mismatch" as HdUiState, chart: null };
  const metadata = getHdState(hd);
  const completeness = getHumanDesignCompleteness(hd);
  const complete = completeness.missingCoreFields.filter(field =>
    !["status", "source", "calculationQuality", "hdEngineVersion"].includes(field)).length === 0;
  const settled = metadata.state === "CANONICAL" || metadata.provenance === "historical";
  const chart = complete && settled ? hd as HumanDesignChart : null;
  const due = isHdRecoveryDue(hd);
  const state: HdUiState = chart
    ? metadata.state === "CANONICAL" && match === "MATCH" ? "ready_canonical" : "ready_historical"
    : due.reason === "exhausted" ? "exhausted"
      : metadata.state === "RETRIABLE_ERROR" || metadata.state === "TERMINAL_ERROR" || metadata.state === "CANONICAL" ? "retryable_error" : "pending";
  return { state, chart };
}
