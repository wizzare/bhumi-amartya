"use client";

import { useEffect } from "react";
import type { PluginListenerHandle } from "@capacitor/core";
import { refreshGentleNightReminder } from "@/lib/notifications/gentleNightReminder";

export function GentleNightReminderLifecycle() {
  useEffect(() => {
    let listener: PluginListenerHandle | undefined;
    let disposed = false;

    void refreshGentleNightReminder();

    void import("@capacitor/app").then(async ({ App }) => {
      const handle = await App.addListener("appStateChange", ({ isActive }) => {
        if (isActive) void refreshGentleNightReminder();
      });
      if (disposed) await handle.remove();
      else listener = handle;
    });

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") void refreshGentleNightReminder();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      void listener?.remove();
    };
  }, []);

  return null;
}
