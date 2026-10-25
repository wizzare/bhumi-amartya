"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { loadHdView } from "@/lib/humandesign/hdLoad";
import { readHdBlueprint } from "@/lib/humandesign/hdRead";
import type { HdUiState } from "@/lib/humandesign/hdView";
import { HdStatus } from "./HdStatus";

export function HdStoredStatus({ busy = false }: { busy?: boolean }) {
  const auth = useAuth();
  const user = auth?.user;
  const input = auth?.userProfile;
  const [result, setResult] = useState<{ user: typeof user; state: HdUiState } | null>(null);
  useEffect(() => {
    if (!user || busy) return;
    const controller = new AbortController();
    let generation = 0;
    const read = () => {
      const request = ++generation;
      void loadHdView({ uid: user.uid, session: user,
        input: input as unknown as Record<string, unknown> | null,
        signal: controller.signal, active: () => !controller.signal.aborted && request === generation, online: navigator.onLine,
        read: () => readHdBlueprint(user.uid, controller.signal),
      }).then(outcome => {
        if (!controller.signal.aborted && request === generation) setResult({ user, state: outcome.state });
      });
    };
    read();
    window.addEventListener("online", read);
    window.addEventListener("offline", read);
    return () => {
      controller.abort();
      window.removeEventListener("online", read);
      window.removeEventListener("offline", read);
    };
  }, [user, input, busy]);
  const state = !auth?.authStateResolved ? "loading" : !user ? "authentication_required"
    : busy || result?.user !== user ? "loading" : result.state;
  return <HdStatus state={state} busy={busy} />;
}
