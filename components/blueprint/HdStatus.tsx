import React from "react";
import { hdUiCopy, type HdUiState } from "@/lib/humandesign/hdView";

export function HdStatus({ state, busy = false }: { state: HdUiState; busy?: boolean }) {
  return <p role={state === "read_error" ? "alert" : "status"} aria-live="polite" aria-busy={busy || state === "loading"} data-hd-state={state}>{hdUiCopy[state]}</p>;
}
